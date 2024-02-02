<?php
/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Controller\Getapidata;
use Magento\Framework\App\Action\HttpGetActionInterface;

class Index implements HttpGetActionInterface
{

    /**
     * @var JsonFactory
     */
    private $resultJsonFactory;

     /**
     * @var \Magento\Customer\Helper\Session\CurrentCustomerAddress
     */
    private $currentCustomerAddress;

     /**
     * @var \Magento\Framework\App\Http\Context
     */
    private $httpContext;

    /**
     * @var UtilHelper
     */
    private $_util;

    /**
     * @var \Magento\Backend\App\ConfigInterface
     */
    protected $_config;

    /**
     * @var Logger
     */
    protected $logger;

    public function __construct(
     \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
     \Magento\Customer\Helper\Session\CurrentCustomerAddress $currentCustomerAddress,
     \Magento\Framework\App\Http\Context $httpContext,
     \OMS\Appbuilder\Helper\UtilHelper $util,
     \Magento\Backend\App\ConfigInterface $config,
     \OMS\Appbuilder\Logger\Logger $logger
    ) {
     $this->resultJsonFactory = $resultJsonFactory;
     $this->currentCustomerAddress = $currentCustomerAddress;
     $this->httpContext = $httpContext;
     $this->_util = $util;
     $this->_config = $config;
     $this->logger = $logger;
    }
    
    /**
     * Execute action and return JSON response.
     */
    public function execute(){
    
       $resultJson = $this->resultJsonFactory->create();
       $responce_data = array();
       $api_data = array();
       // getting api keys from config 
       $base_webhookurl = $this -> _config -> getValue('omsappbuilder/services/base_webhookurl');
       $ibm_org_id = $this -> _config -> getValue('omsappbuilder/connection/x-gw-ims-org-id');
      
       $this->logger->info("API Data Logger Started");
       try {
            $access_token = $this->_util->getAccessToken();
            $shippingAddress = $this->getDefaultShippingAddress();
            
            $api_data['API_CONFIG_DATA']['base_webhookurl'] = $base_webhookurl; 
            $api_data['API_CONFIG_DATA']['ibm_org_id'] = $ibm_org_id; 
            $api_data['API_CONFIG_DATA']['access_token'] = $access_token;
            $responce_data = array_merge($api_data, $shippingAddress);
            
            return $resultJson->setData([
                $responce_data
            ]);
        } catch (\Exception $e) {
             $this->logger->info($e->getMessage());
            return $resultJson->setData([
                $responce_data
            ]);
    }
    
  }

    /**
     * Array for Shipping Address
     *
     * @return \Magento\Framework\Phrase|string
     */
    public function getDefaultShippingAddress()
    {
        $customer_params = array();
        $isLoggedin = $this->getLogin();
        if($isLoggedin){
            $customer_params['customer_data']['isLoggedin']  = true;
            $address = $this->currentCustomerAddress->getDefaultShippingAddress();
            if(!empty($address)){
                $shipping_address = $address->__toArray();
                $customer_params['customer_data']['shipping_address']  = $shipping_address;
            }else{
                $customer_params['customer_data']['shipping_address']  = false;
            }

            }else{
                $customer_params['customer_data']['isLoggedin']  = false;
            }
      
        return $customer_params;
    }

    /*
     * return bool
     */
    public function getLogin() {
        return (bool)$this->httpContext->getValue(\Magento\Customer\Model\Context::CONTEXT_AUTH);
    }
    
}
