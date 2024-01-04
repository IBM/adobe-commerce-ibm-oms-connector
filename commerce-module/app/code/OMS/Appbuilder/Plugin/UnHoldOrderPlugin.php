<?php
 /**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Plugin;
use OMS\Appbuilder\Helper\UtilHelper;

class UnHoldOrderPlugin
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

    public function beforeUnHold(\Magento\Sales\Api\OrderManagementInterface $subject,$id) {
        $order = $this->orderRepository->get($id);
        if($order -> canUnhold()) {
            
            $urlPost = $this -> _config -> getValue('omsappbuilder/services/orderunhold_webhookurl');
            $params = array();
            
            $params['HoldType'] = 'Commerce_Hold';
            $params['OrderNo'] = $id;
                   
            $this -> _util -> getCurlResponseOrderUnhold($urlPost, $params);
           
        }
        return $id;

    }
}


