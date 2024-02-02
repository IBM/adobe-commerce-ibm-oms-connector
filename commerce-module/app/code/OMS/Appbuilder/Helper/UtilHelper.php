<?php
 /**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
declare(strict_types=1);
namespace OMS\Appbuilder\Helper;
use Exception;

class UtilHelper
{
    /**
     * @var \Magento\Backend\App\ConfigInterface
     */
    protected $_config;

     /**
     * @var Logger
     */
    protected $_logger;

    public function __construct(
        \Magento\Backend\App\ConfigInterface $config,
        \OMS\Appbuilder\Logger\Logger $logger
    ) {
        $this -> _config = $config;
        $this->_logger = $logger;
        
    }
   
    public function getAccessToken() {
        $api_url = $this -> _config -> getValue('omsappbuilder/connection/base_url');
        $reqObj = new Json();
        $reqObj -> grant_type = 'client_credentials';
        $reqObj -> client_id = $this -> _config -> getValue('omsappbuilder/connection/client_id');
        $reqObj -> client_secret = $this -> _config -> getValue('omsappbuilder/connection/client_secret');
        $reqObj -> scope = $this -> _config -> getValue('omsappbuilder/connection/scope');

        $response = $this -> getCurlAccessTokenResponce($api_url, $reqObj);
        return $response;  
        
    }
    
   public function getCurlAccessTokenResponce($url, $reqObj) {
        try {
            // Custom Logger 
            $this->_logger->info("getAccessToken method starting\n");
            $this->_logger->info("getAccessToken Request Body ======>\n" . print_r($reqObj, true) . "");
            $this->_logger->info("getAccessToken Request URL ======>\n" . $url . "");
            // End Custom Logger
    
            $ch = curl_init();
            $request = http_build_query($reqObj);
            $headers = array(
                "Content-Type: application/x-www-form-urlencoded",
                "Access-Control-Request-Headers" => "XRequested-With",
                "AccessControl-Allow-Origin" => "*",
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_SSL_VERIFYHOST=>true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
           
            $res = curl_exec($ch);
            $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    
            $this->_logger->info("getAccessToken Curl Response Status code======>\n" . $status);
            $this->_logger->info("getAccessToken Response Body ======>\n" . $res);
    
            // Handle cURL errors
            if ($res === false) {
                $error = curl_error($ch);
                $this->_logger->error("Access token cURL error: " . $error);
                curl_close($ch);
                return json_encode([]); 
            }
    
            // Check if the response is successful
            if ($status === 200) {
                $response_json = json_decode($res);
    
                if (!empty($response_json) && isset($response_json->access_token)) {
                    $response_json->CurlStatus = $status;
                    curl_close($ch);
                    return $response_json->access_token;
                } else {
                    $this->_logger->info("getAccessToken Response object is empty");
                    return json_encode([]); 
                }
            } else {
                $this->_logger->info("Access Token Curl Response:: Non-200 HTTP status code received: " . $status);
                return json_encode([]); 
            }
    
            curl_close($ch);
        } catch (\Exception $e) {
            $this->_logger->error("Access Token Curl Response Exception::" . $e->getMessage());
            return json_encode([]); 
        }
    } 
    
    public function getCurlResponseOrderCancel($url, $reqObj) {
        
        /*  Custom Logger */
        $this->_logger -> info("getCurlResponse method starting\n");
        $this->_logger -> info("Request Body ======>\n" . json_encode($reqObj) . "");
        $this->_logger -> info("Request URL ======>\n" . $url . "");
         /* End  Custom Logger */
        $accessToken = $this ->getAccessToken();
        $xgwimsorgid = $this -> _config -> getValue('omsappbuilder/connection/x-gw-ims-org-id');
        $ch = curl_init();
        $request = json_encode($reqObj);
        $ch = curl_init();
        $headers = array(
            "Content-Type: application/json",
            "Authorization: Bearer $accessToken",
            "Access-Control-Request-Headers" => "XRequested-With",
            "x-gw-ims-org-id: $xgwimsorgid",
            "AccessControl-Allow-Origin" => "*",
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_SSL_VERIFYHOST=>true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
       
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $this->_logger -> info("Curl Response Status code======>\n" . $status);
        $this->_logger -> info("Response Body ======>\n" . $res);
        
        // Check if $res is a string
        if (!is_string($res)) {
            $this->_logger->error("Response is not a string");
            throw new \Magento\Framework\Exception\LocalizedException(__('Invalid response received.'));
        }
        $response_json = json_decode($res);
        if (empty($response_json)) {
            $this->_logger -> info("Response object is empty");
            $response_json = new Json();
        }
        $response_json -> CurlStatus = $status;
        curl_close($ch);
        if(!($status >= 200 && $status <= 299)){
           
            $this->_logger->error("Not getting response code in between 200 to 299");
            $errMsg = "Internal Server Error";
            try{
                if(isset($response_json -> error)) {
                    $errMsg = $response_json -> error;
                }
            }catch (\Exception $e) {
                $this->_logger->error("Got Exception while featching the error msg for failed request ======>".$e->getMessage());
            }
            $this->_logger->info("Order Cancel OMS API Response Error Msg ======>".$errMsg);
            throw new \Magento\Framework\Exception\LocalizedException(__('%1', "Order Cancel OMS API Response Error::".$errMsg));
            
        } 
        if($response_json->CancelAllowed === false){

            throw new \Magento\Framework\Exception\LocalizedException(__('%1', $response_json->message));
        }
    
    }


    public function getCurlStockResponse($url, $reqObj) {
      try{
        /*  Custom Logger */
        $this->_logger -> info("getCurlStockResponse method starting\n");
        $this->_logger -> info("Request Stock Body ======>\n" . json_encode($reqObj) . "");
        $this->_logger -> info("Request stock URL ======>\n" . $url . "");
         /* End  Custom Logger */
        $xgwimsorgid = $this -> _config -> getValue('omsappbuilder/connection/x-gw-ims-org-id');
        $this->_logger -> info("xgwimsorgid  ======>\n" . $xgwimsorgid  . "");
        $accessToken = $this ->getAccessToken();
        $ch = curl_init();
        $request = json_encode($reqObj);
        $ch = curl_init();
        $headers = array(
            "Content-Type: application/json",
            "Authorization: Bearer $accessToken",
            "Access-Control-Request-Headers" => "XRequested-With",
            "x-gw-ims-org-id: $xgwimsorgid", 
            "AccessControl-Allow-Origin" => "*",
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_SSL_VERIFYHOST=>true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
       
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $this->_logger -> info("Curl stock Response Status code======>\n" . $status);
        $this->_logger -> info("Response stock Body ======>\n" . $res);
        if (empty($res)) {
            $this->_logger -> info("Stock Response object is empty");
        }
       
        curl_close($ch);
        if(!($status >= 200 && $status <= 299)){
           
            $this->_logger->error("Not getting response code in between 200 to 299");
            $errMsg = "Internal Server Error";
            $this->_logger->info("Response Error Msg ======>".$errMsg);
            return json_encode([]); 
        } 
         return $res;
      }catch (\Exception $e) {
             $this->_logger->error("Got Exception while featching the stock error msg for failed request ======>".$e->getMessage());
             return json_encode([]); 
        }
    }

    public function calculateStock($quoteItems = array(), $responceStockItems = array())
    {
       try{
        $this->_logger->info("Quote Item Items: ".print_r($quoteItems,true));
        $this->_logger->info("Responce stocks Items: ".print_r($responceStockItems,true)); 
         $results = [];

          // Loop through each item in $items
            foreach ($quoteItems as $item) {
            // Find the corresponding $item_qty based on 'itemId'
            $stock_item_qty = null;
            foreach ($responceStockItems as $qty) {
                if ($qty["ItemID"] == $item["itemId"]) {
                    $stock_item_qty = $qty;
                    break;
                }
            }

            // Check if 'qty' is greater than to 'AvailableQuantity'
            if ($stock_item_qty !== null && $item['qty'] > $stock_item_qty['AvailableQuantity']) {
                // Create a new array with 'sku' and 'itemId' which not available in stock
                $result = [
                    "name"    => $item['name'],
                    "itemId" => $item['itemId']
                ];

                $results[] = $result;
            }
        }
            $this->_logger->info("Unvailable Stock Items: ".print_r($results,true));
        
            return $results;
     }catch (\Exception $e) {
        $this->_logger->error("Got Exception calculating stock ======>".$e->getMessage());
   }
}
    
  ### Order Unhold Api Call ####
  public function getCurlResponseOrderUnhold($url, $reqObj) {
        
    /*  Custom Logger */
    $this->_logger -> info("Order Unhold curl started method starting\n");
    $this->_logger -> info("Request Body ======>\n" . json_encode($reqObj) . "");
    $this->_logger -> info("Request URL ======>\n" . $url . "");
     /* End  Custom Logger */
    $xgwimsorgid = $this -> _config -> getValue('omsappbuilder/connection/x-gw-ims-org-id');
    $accessToken = $this ->getAccessToken();
    $ch = curl_init();
    $request = json_encode($reqObj);
    $ch = curl_init();
    $headers = array(
        "Content-Type: application/json",
        "Authorization: Bearer $accessToken",
        "Access-Control-Request-Headers" => "XRequested-With",
        "x-gw-ims-org-id: $xgwimsorgid", 
        "AccessControl-Allow-Origin" => "*",
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_SSL_VERIFYHOST=>true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
   
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $this->_logger -> info("Order Unhold Curl Response Status code======>\n" . $status);
    $this->_logger -> info("Order Unhold Response Body ======>\n" . $res);
    
    // Check if $res is a string
     if (!is_string($res)) {
        $this->_logger->error("Response is not a string");
        throw new \Magento\Framework\Exception\LocalizedException(__('Invalid response received.'));
    }
    $response_json = json_decode($res);
    if (empty($response_json)) {
        $this->_logger -> info("Order Unhold Response object is empty");
        $response_json = new Json();
    }
    $response_json -> CurlStatus = $status;
    curl_close($ch);
    if(!($status >= 200 && $status <= 299)){
       
        $this->_logger->error("Order Unhold Not getting response code in between 200 to 299");
        $errMsg = "Internal Server Error";
        try{
            if(isset($response_json -> error)) {
                $errMsg = $response_json -> error;
            }
        }catch (\Exception $e) {
            $this->_logger->error("Got Exception while featching for unhold api the error msg for failed request ======>".$e->getMessage());
        }
        $this->_logger->info("Order Unhold Response Error Msg ======>".$errMsg);
        throw new \Magento\Framework\Exception\LocalizedException(__('%1', "Order Unhold OMS Response Error::".$errMsg));
    } 
    if($response_json->success === false){

        throw new \Magento\Framework\Exception\LocalizedException(__('%1', $response_json->message));
    }

}
    
}
