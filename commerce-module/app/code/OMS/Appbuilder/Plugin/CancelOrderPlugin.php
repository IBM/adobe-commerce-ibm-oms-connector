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
    protected $orderRepository;
    protected $_config;
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
            
            $urlPost = $this -> _config -> getValue('omsappbuilder/services/cancel_order_webhookurl');
            $params = array();
            $params['data']['DocumentType'] = $this -> _config -> getValue('omsappbuilder/services/DocumentType');
            $params['data']['EnterpriseCode'] = $this -> _config -> getValue('omsappbuilder/services/EnterpriseCode');
            $params['data']['OrderNo'] = $id;
                      
            $this -> _util -> getCurlResponse($urlPost, $params);
           
        }
        return $id;

    }
}
