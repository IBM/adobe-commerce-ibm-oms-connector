<?php
 /**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Checkout\Model\Cart as CustomerCart;
use Magento\Framework\Message\ManagerInterface;
use Magento\Framework\App\Response\RedirectInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\Phrase;
use Magento\Checkout\Exception;
use OMS\Appbuilder\Logger\Logger;
use OMS\Appbuilder\Helper\UtilHelper;
use OMS\Appbuilder\Helper\OmsReservationHelper;


class ValidateCartObserver implements ObserverInterface
{
    /**
     * @var ManagerInterface
     */
    protected $messageManager;

    /**
     * @var RedirectInterface
     */
    protected $redirect;

    /**
     * @var Cart
     */
    protected $cart;
    protected $_config;
    private $_util;
    //private $_omsReservationHelper;
    private Logger $logger;

    /**
     * @param ManagerInterface $messageManager
     * @param RedirectInterface $redirect
     * @param CustomerCart $cart
     */
    public function __construct(
        ManagerInterface $messageManager,
        RedirectInterface $redirect,
        CustomerCart $cart,
        \Magento\Backend\App\ConfigInterface $config,
        UtilHelper $util,
        OmsReservationHelper $omsReservationHelper,
        Logger $logger
    ) {
        $this->messageManager = $messageManager;
        $this->redirect = $redirect;
        $this->cart = $cart;
        $this->_config = $config;
        $this->_util = $util;
        $this->_omsReservationHelper = $omsReservationHelper;
        $this->logger = $logger;
    }

    /**
     * Validate Cart Before going to checkout
     * - event: controller_action_predispatch_checkout_index_index
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer){
    
        try {
        $quote = $this->cart->getQuote();
        $controller = $observer->getControllerAction();
        $cartItemsQty = $quote->getItemsQty();
        $this->logger->info("Observer getItemsQty:" . $cartItemsQty);

        if ($cartItemsQty > 0) {
            $start = microtime(true);
            $this->logger->info("Starting CheckStockBeforeValidateQuote plugin");
            $urlPost = $this->_config->getValue('omsappbuilder/services/stock_detail_webhookurl');

            $items = [];
            $reservationItems = [];
            $index = 0;
            $getOneSku = '';

            foreach ($quote->getItems() as $quoteitem) {
                $item = [
                    "itemId" => $quoteitem->getProductId(),
                    "lineId" => ($index + 1),
                    "name" => $quoteitem->getName(),
                    'qty' => $quoteitem->getQty()
                ];

                $item_reservation = [
                    "product_id" => $quoteitem->getProductId(),
                    "qty_ordered" => $quoteitem->getQty()
                ];

                $items[] = $item;
                $reservationItems[] = $item_reservation;
                $getOneSku = $quoteitem->getSku();
                $index++;
            }

            // Create the data array
            $params = [
                "data" => [
                    "items" => $items
                ]
            ];

            // Convert the data array to JSON
            $jsonData = json_encode($params);
            $stock_responce = $this->_util->getCurlStockResponse($urlPost, $params);

            // Decode JSON data
            $stockData = json_decode($stock_responce, true);
            
            if (!empty($stockData)) 
             {
                // Extract ItemID and AvailableQuantity from each PromiseLine
                $stockItems = [];

                if (isset($stockData['PromiseLines']['PromiseLine'])) {
                    foreach ($stockData['PromiseLines']['PromiseLine'] as $promiseLine) {
                        $itemID = $promiseLine['ItemID'];
                        $availableQuantity = $promiseLine['Availability']['AvailableInventory']['AvailableQuantity'];

                        $item = [
                            "ItemID" => $itemID,
                            "AvailableQuantity" => $availableQuantity,
                        ];

                        $stockItems[] = $item;
                    }
                }

                $itemUnvailable = $this->_util->calculateStock($items, $stockItems);

                if (!empty($itemUnvailable)) {
                    $stock_productname = array_column($itemUnvailable, 'name');
                    $product_name = implode(', ', $stock_productname);

                    $this->messageManager->addErrorMessage(
                        __('Please review your cart!')
                    );

                    $this->messageManager->addNoticeMessage(
                        __(new Phrase(sprintf("Missing Stock for product::  %s", $product_name)))
                    );

                    $this->redirect->redirect($controller->getResponse(), 'checkout/cart');
                } else {
                    // OMS Reservation logic
                    $SourceNode = $this->_omsReservationHelper->getPickupSelectedStore();
                    if($SourceNode !== null) 
                    {
                        $quoteId = $quote->getId();
                        $reservationWebhookPostUrl = $this->_config->getValue('omsappbuilder/services/reservation_oms_webhookurl');
                        $enterpriseCode = $this->_config->getValue('omsappbuilder/services/EnterpriseCode');

                        $reservationParams = [
                            "data" => [
                                "nodeId" => $SourceNode,
                                "orgId" => $enterpriseCode,
                                "reservationId" => "reservation-" . $quoteId,
                                "items" => $reservationItems
                            ]
                        ];

                        // Convert the data array to JSON
                        $reservationJsonData = json_encode($reservationParams);
                        $this->logger->info("Reservation parameter::" . $reservationJsonData);

                        $reservation_responce = $this->_util->getCurlStockResponse($reservationWebhookPostUrl, $reservationParams);
                        $this->logger->info("Reservation Responce: " . $reservation_responce);
                    
                        // Decode JSON data
                        $reservationData = json_decode($reservation_responce, true);
                        
                        if (isset($reservationData['Success']) && $reservationData['Success'] === true) {
                            $this->_omsReservationHelper->setOmsReservationAttribute($reservationData['ReservationId'], $quoteId);
                        } else {
                            $this->messageManager->addErrorMessage(
                                __($reservationData['Message'])
                            );

                            $this->redirect->redirect($controller->getResponse(), 'checkout/cart');
                        }
                    }
                    // End for OMS Reservation logic
                }

                $time_elapsed_secs = microtime(true) - $start;
                $this->logger->info("Elapsed OK time: " . $time_elapsed_secs);
            }else {
                $this->messageManager->addErrorMessage(
                    __('OMS API Responce Error.')
                );

                $this->redirect->redirect($controller->getResponse(), 'checkout/cart'); 

             }
        }

    } catch (\Exception $e) {
        $this->logger->error($e->getMessage());
    }

    return $this;
}

}