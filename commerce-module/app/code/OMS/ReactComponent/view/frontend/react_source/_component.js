/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */

jQuery(document).ready(function($) {
    var ItemQty = 1;
    ItemQty = jQuery("#qty").val();
    var ItemId = jQuery("input[name='item']").val();
     
   jQuery("#qty").on("input", function() {
         ItemQty =  jQuery(this).val(); 
         console.log('ItemQTY'+ItemQty); 
    });  
    

// Ajax function //
function getApiDataJson() {
    var ajaxUrl = BASE_URL+'getapidata/Getapidata/Index';
    return JSON.parse($.ajax({
        type: 'GET',
        url: ajaxUrl,
        dataType: 'json',
        global: false,
        async: false,
        success: function (data) {
          return data;
        }
    }).responseText);
}
// End for Ajax function //
var jsonData = getApiDataJson();
    console.log('ComponentDATA:');
    console.log(jsonData);
// Check if JSON is not empty
if (jsonData.length > 0 && jsonData[0].API_CONFIG_DATA)  {
   console.log('api-data');
    var isLoggedin = jsonData[0].customer_data.isLoggedin;
    var ibmOrgId = jsonData[0].API_CONFIG_DATA.ibm_org_id;
    var accessToken = jsonData[0].API_CONFIG_DATA.access_token;
    var base_webhookurl = jsonData[0].API_CONFIG_DATA.base_webhookurl; 
if (isLoggedin === true && jsonData[0].customer_data.shipping_address) {
    console.log('cust login');
    var countryId = jsonData[0].customer_data.shipping_address.country_id;
    var postcode = jsonData[0].customer_data.shipping_address.postcode;
   //Component GetDeliveryTime
    if (document.getElementById('root-pdp-react-delivery-time')) {
        const element = document.getElementById('root-pdp-react-delivery-time');
        const Deliveryinfo = React.lazy(() => import('delivery_time/index'));
        ReactDOM.render(<React.Suspense fallback={<div dangerouslySetInnerHTML={{__html: element.innerHTML}}/>}>
            <Deliveryinfo originalContent={element.innerHTML} 
            buttonColor="#1a79c2"
            webhookURL={base_webhookurl}
            ibmOrganizationId={ibmOrgId}
            itemId={ItemId}
            country={countryId}
            zipCode={postcode}
            requiredQty={ItemQty}
            webhookAccessToken={accessToken}
            />
        </React.Suspense>, element);
    }
}
//Component selectLocationStock
if (document.getElementById('root-pdp-react-selectsource')) {
    const element = document.getElementById('root-pdp-react-selectsource');
    const SourceLocations = React.lazy(() => import('location_stock_availability/index'));
    ReactDOM.render(<React.Suspense fallback={<div dangerouslySetInnerHTML={{__html: element.innerHTML}}/>}>
        <SourceLocations originalContent={element.innerHTML}
          isSourceButtonShow={true}
          isInstoreButtonShow={false}
          webhookURL={base_webhookurl}
          webhookAccessToken={accessToken}
          itemId={ItemId}
          lineId="1"
          organizationId={ibmOrgId}
        />
    </React.Suspense>, element);
}

//Component DeliveryMethod
if (document.getElementById('root-pdp-react-select-delivery-method')) {
    const element = document.getElementById('root-pdp-react-select-delivery-method');
    const DeliveryMethod = React.lazy(() => import('delivery_method/index'));
    ReactDOM.render(<React.Suspense fallback={<div dangerouslySetInnerHTML={{__html: element.innerHTML}}/>}>
        <DeliveryMethod originalContent={element.innerHTML} 
         webhookURL={base_webhookurl}
         webhookAccessToken={accessToken}
         itemId={ItemId}
         lineId="1"
         organizationId={ibmOrgId}
        />
    </React.Suspense>, element);
}
}else {
    console.log("API data is empty.");
}
});


