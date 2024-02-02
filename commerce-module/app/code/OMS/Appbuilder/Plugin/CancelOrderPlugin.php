<?php
 /**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Plugin;
use OMS\Appbuilder\Helper\UtilHelper;

class CancelOrderPlugin
{
    /**
     * @var \Magento\Sales\Api\OrderRepositoryInterface
     */
    protected $orderRepository;

    /**
     * @var \Magento\Backend\App\ConfigInterface
     */
    protected $_config;

     /**
     * @var UtilHelper
     */
    private $_util;

    public function __construct(
        \Magento\Backend\App\ConfigInterface $config,
        \Magento\Sales\Api\OrderRepositoryInterface $orderRepository,
        UtilHelper $util
    ) {
        $this->_util = $util;
        $this->orderRepository = $orderRepository;
        $this->_config = $config;
    }

    public function beforeCancel(
        \Magento\Sales\Api\OrderManagementInterface $subject,
                                                    $id) {
        $order = $this->orderRepository->get($id);
        if($order -> canCancel() && $order -> getShippingAddress() != null) {
            $base_webhookurl = $this -> _config -> getValue('omsappbuilder/services/base_webhookurl');
            $urlPost = $base_webhookurl.$this -> _config -> getValue('omsappbuilder/services/cancel_order_webhookurl');
            $params = array();
            $params['data']['EnterpriseCode'] = $this -> _config -> getValue('omsappbuilder/services/EnterpriseCode');
            $params['data']['OrderNo'] = $id;
                      
            $this -> _util -> getCurlResponseOrderCancel($urlPost, $params);
           
        }
        return $id;

    }
}
