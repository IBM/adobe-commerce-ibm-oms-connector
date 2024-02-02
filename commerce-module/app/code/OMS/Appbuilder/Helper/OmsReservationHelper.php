<?php
/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Helper;
use Magento\Quote\Model\QuoteFactory;
use OMS\Appbuilder\Logger\Logger;

class OmsReservationHelper
{
    /**
     * @var QuoteFactory
     */
    protected $quoteFactory;

     /**
     * @var Logger
     */
    private $logger;

    public function __construct(
        QuoteFactory $quoteFactory,
        Logger $logger
    ) {
        $this->quoteFactory = $quoteFactory;
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
        if (($reactDeliveryMethod == 2) && ($reactSelectedStore !== null)) {
            return $reactSelectedStore;
        }

        return null;
    }
}
