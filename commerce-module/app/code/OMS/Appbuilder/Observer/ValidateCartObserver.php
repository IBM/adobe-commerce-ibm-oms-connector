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
use Magento\Catalog\Api\ProductRepositoryInterface;


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

    /**
     * @var \Magento\Backend\App\ConfigInterface
     */
    protected $_config;

    /**
     * @var UtilHelper
     */
    private $_util;

    /**
     * @var OmsReservationHelper
     */
    private $_omsReservationHelper;

    /**
     * @var ProductRepositoryInterface
     */
    protected $productRepository;
    /**
     * @var Logger
     */
    private $logger;

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
        ProductRepositoryInterface $productRepository,
        Logger $logger
    ) {
        $this->messageManager = $messageManager;
        $this->redirect = $redirect;
        $this->cart = $cart;
        $this->_config = $config;
        $this->_util = $util;
        $this->_omsReservationHelper = $omsReservationHelper;
        $this->productRepository = $productRepository;
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
            $base_webhookurl = $this -> _config -> getValue('omsappbuilder/services/base_webhookurl');
            $urlPost = $base_webhookurl.$this->_config->getValue('omsappbuilder/services/stock_detail_webhookurl');

            $items = [];
            $reservationItems = [];
            $index = 0;

            foreach ($quote->getItems() as $quoteitem) {
                // Check if the product is a configurable product
                if ($quoteitem->getProductType() === \Magento\ConfigurableProduct\Model\Product\Type\Configurable::TYPE_CODE) {
                    // For configurable products, get the selected simple product (child)
                    $productOption = $quoteitem->getOptionByCode('simple_product');
                   
                        $childProductId = $productOption->getProductId();
                        try {
                            // Load product by ID
                            $product = $this->productRepository->getById($childProductId);
                            // Get the name of the child product
                            $childProductName = $product->getName();
                        } catch (\Magento\Framework\Exception\NoSuchEntityException $e) {
                            // Handle the case when the product cannot be loaded
                            $childProductName = 'Unknown'; // Set a default name
                        }
                } else {
                    // For other product types (simple, bundle, virtual, etc.), use the product ID and name directly
                    $childProductId = $quoteitem->getProductId();
                    $childProductName = $quoteitem->getName();
                }
               
                $item = [
                    "itemId" => $childProductId,
                    "lineId" => ($index + 1),
                    "name" => $childProductName, // Use the child product name
                    'qty' => $quoteitem->getQty()
                ];
            

                $item_reservation = [
                    "product_id" => $childProductId,
                    "qty_ordered" => $quoteitem->getQty()
                ];

                $items[] = $item;
                $reservationItems[] = $item_reservation;
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
                        $reservationWebhookPostUrl = $base_webhookurl.$this->_config->getValue('omsappbuilder/services/reservation_oms_webhookurl');
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