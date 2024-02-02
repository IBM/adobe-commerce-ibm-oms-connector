<?php
 /**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Plugin;

use Magento\Sales\Api\Data\OrderInterface;
use Magento\Sales\Api\OrderManagementInterface;
use OMS\Appbuilder\Logger\Logger;

class DeleteCookiePlugin
{
    /**
     * @var \Magento\Framework\Stdlib\CookieManagerInterface CookieManagerInterface
     */
    private $cookieManager;

    /**
     * @var \Magento\Framework\Stdlib\Cookie\CookieMetadataFactory CookieMetadataFactory
     */
    private $cookieMetadataFactory;
    /**
     * @var Logger
     */
    private $logger;
    public function __construct(
        \Magento\Framework\Stdlib\CookieManagerInterface $cookieManager,
        \Magento\Framework\Stdlib\Cookie\CookieMetadataFactory $cookieMetadataFactory,
        Logger $logger,
    ) {
        $this->cookieManager = $cookieManager;
        $this->cookieMetadataFactory = $cookieMetadataFactory;
        $this->logger = $logger;
    }

    public function afterPlace(OrderManagementInterface $subject, OrderInterface $result) {
        
        $orderId = $result->getIncrementId();

        if ($orderId) {
        	if ($this->cookieManager->getCookie('reactDeliveryMethod')) {
                $metadata = $this->cookieMetadataFactory->createPublicCookieMetadata();
                $metadata->setPath('/');
                $this->cookieManager->deleteCookie('reactDeliveryMethod',$metadata);
            }
            if ($this->cookieManager->getCookie('reactSelectedStore')) {
                $metadata = $this->cookieMetadataFactory->createPublicCookieMetadata();
                $metadata->setPath('/');
                $this->cookieManager->deleteCookie('reactSelectedStore',$metadata);
            }
        }
        return $result;

    }
}
