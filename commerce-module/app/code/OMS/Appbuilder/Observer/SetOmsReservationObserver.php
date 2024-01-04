<?php
 /**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);

namespace OMS\Appbuilder\Observer;

use Exception;
use Magento\Framework\Event\ObserverInterface;
 
class SetOmsReservationObserver implements ObserverInterface
{
   
    /**
     * @param Observer $observer
     * @return $this;
     * @throws Exception
     */
 
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
      $order = $observer->getEvent()->getData('order');
      $quote = $observer->getEvent()->getData('quote');
      if($quote->getOmsReservationId()) {
         $order->setOmsReservationId($quote->getOmsReservationId());
      }
      return $this;
    }
}