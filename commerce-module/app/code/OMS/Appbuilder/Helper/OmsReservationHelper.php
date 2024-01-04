<?php
/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Helper;
use Magento\Quote\Model\QuoteFactory;
use Magento\InventoryApi\Api\GetSourceItemsBySkuInterface;
use Magento\Framework\Api\SearchCriteriaBuilder;
use OMS\Appbuilder\Logger\Logger;

class OmsReservationHelper
{
    /**
     * @var QuoteFactory
     */
    protected $quoteFactory;

     /**
     * @var GetSourceItemsBySkuInterface
     */
    private $sourceItemsBySku;

    /**
     * @var SearchCriteriaBuilder
     */
    private $searchCriteriaBuilder;

     /**
     * @var Logger
     */
    private $logger;

     /**
     * YourClass constructor.
     * @param GetSourceItemsBySkuInterface $sourceItemsBySku
     * @param SearchCriteriaBuilder $searchCriteriaBuilder
     */
    public function __construct(
        QuoteFactory $quoteFactory,
        GetSourceItemsBySkuInterface $sourceItemsBySku,
        SearchCriteriaBuilder $searchCriteriaBuilder,
        Logger $logger
    ) {
        $this->quoteFactory = $quoteFactory;
        $this->sourceItemsBySku = $sourceItemsBySku;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        $this->logger = $logger;
    }

    public function setOmsReservationAttribute($omsReservationValue , $quoteId)
    {
      try {
        // Load the quote by ID
        $quote = $this->quoteFactory->create()->load($quoteId);
        // Set the value for the attribute
        $quote->setData('oms_reservation_id', $omsReservationValue);
        $this->logger->info("OMSResravtionID::".$quote->getData('oms_reservation_id'));
        // Save the quote
        $quote->save();
      } catch (\Exception $e) {
        $this->logger->error('Error in setOmsReservationAttribute: ' . $e->getMessage());
      }
    }

    /**
     * Get inventory sources for a product by SKU
     *
     * @param string $sku
     * @return array
     */
    public function getInventorySourcesBySku(string $sku)
    {
      
    try {
        $sourceItems = $this->sourceItemsBySku->execute($sku);
        // Check if $sourceItems is an array
        if (is_array($sourceItems) && count($sourceItems) > 0) {
            end($sourceItems);
            $lastKey = key($sourceItems);
            // Retrieve the last element
            $lastSourceItem = $sourceItems[$lastKey];
            // get the source code from the last element
            $lastSourceCode = $lastSourceItem['source_code'];
            $this->logger->info("Reservation Node::" . $lastSourceCode);
            return $lastSourceCode;
        } else {
            // Handle the case where $sourceItems is not an array or is empty
            throw new \Exception('Unexpected return type or empty array from execute.');
        }
    } catch (\Exception $e) {
        // Log the error for debugging purposes
        $this->logger->error('Error in getInventorySourcesBySku: ' . $e->getMessage());
        return null; 
    }
    }

    /**
     * Get cookie data and return "reactSelectedStore" when "reactDeliveryMethod" is 2 and "reactSelectedStore" is not null
     *
     * @return mixed|null
     */
    public function getPickupSelectedStore()
    {
        $reactDeliveryMethod = $_COOKIE['reactDeliveryMethod'] ?? null;
        $reactSelectedStore = $_COOKIE['reactSelectedStore'] ?? null;

        $this->logger->info("Reservation Node From Cookie::" . $reactSelectedStore);
        $this->logger->info("Reservation Delivery Method From Cookie::" . $reactDeliveryMethod);
        if ($reactDeliveryMethod == 2 && $reactSelectedStore !== null) {
            return $reactSelectedStore;
        }

        return null;
    }
}
