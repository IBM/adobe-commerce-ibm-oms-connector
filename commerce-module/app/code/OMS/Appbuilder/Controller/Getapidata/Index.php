<?php
/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Controller\Getapidata;

class Index extends \Magento\Framework\App\Action\Action
{

    /**
     * @var Logger
     */
    protected $logger;
    /**
     * @var \Magento\Framework\App\RequestInterface
     */
    private $request;
    private $customerSession;

    private $_util;
    protected $_config;

    public function __construct(
     \Magento\Framework\App\Action\Context $context,
     \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
     \Magento\Framework\App\RequestInterface $request,
     \Magento\Customer\Model\Session $customerSession,
     \Magento\Customer\Helper\Session\CurrentCustomerAddress $currentCustomerAddress,
     \Magento\Customer\Model\Address\Config $addressConfig,
     \Magento\Framework\App\Http\Context $httpContext,
     \OMS\Appbuilder\Helper\UtilHelper $util,
     \Magento\Backend\App\ConfigInterface $config,
     \OMS\Appbuilder\Logger\Logger $logger
    ) {
     parent::__construct($context);
     $this->resultJsonFactory = $resultJsonFactory;
     $this->request = $request;
     $this->customerSession = $customerSession;
     $this->currentCustomerAddress = $currentCustomerAddress;
     $this->_addressConfig = $addressConfig;
     $this->httpContext = $httpContext;
     $this->_util = $util;
     $this->_config = $config;
     $this->logger = $logger;
    }

  public function execute(){
    
       $resultJson = $this->resultJsonFactory->create();
       $responce_data = array();
       $api_data = array();
       // getting api keys from config 
       $base_webhookurl = $this -> _config -> getValue('omsappbuilder/services/base_webhookurl');
       $delivery_time_Webhookurl = $this -> _config -> getValue('omsappbuilder/services/delivery_time_Webhookurl');
       $location_stock_status_Webhookurl = $this -> _config -> getValue('omsappbuilder/services/location_stock_status_Webhookurl');
       $adobe_apiurl = $this -> _config -> getValue('omsappbuilder/services/adobe_apiurl');
       $adobe_access_token = $this -> _config -> getValue('omsappbuilder/connection/adobe_access_token');
       $ibm_org_id = $this -> _config -> getValue('omsappbuilder/connection/x-gw-ims-org-id');
      
       $this->logger->info("API Data Logger Started");
       try {
            //$customerId = $this->customerSession->getCustomerId();
            $access_token = $this->_util->getAccessToken();
            $shippingAddress = $this->getDefaultShippingAddress();
            
            $api_data['API_CONFIG_DATA']['base_webhookurl'] = $base_webhookurl; 
            $api_data['API_CONFIG_DATA']['delivery_time_Webhookurl'] = $delivery_time_Webhookurl; 
            $api_data['API_CONFIG_DATA']['location_stock_status_Webhookurl'] = $location_stock_status_Webhookurl; 
            $api_data['API_CONFIG_DATA']['adobe_apiurl'] = $adobe_apiurl; 
            $api_data['API_CONFIG_DATA']['adobe_access_token'] = $adobe_access_token; 
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
    public function getCurrentCustomer()
    {
        return $this->customerSession->getCustomer();
    }
    
}

?>