/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */

jQuery(document).ready(function($) {
    var ItemId;
    var ItemQty = 1;
    ItemQty = jQuery("#qty").val();
    jQuery("#qty").on("input", function() {
        ItemQty =  jQuery(this).val(); 
        console.log('ItemQTY'+ItemQty); 
   }); 

    if (jQuery('#product-options-wrapper').length && !jQuery('.bundle-options-wrapper').length) {
        console.log('This is a configurable product');
        jQuery('#react-component-wrapper').hide();
       
        /// Setting config product child id ///
        jQuery(".product-options-wrapper .swatch-opt" ).click(function() {
            var selProId = ($('[data-role=swatch-options]').data('mage-SwatchRenderer').getProduct());
            jQuery("input[name='selected_configurable_option']").val(selProId);
            ItemId = selProId;
            jQuery('#react-component-wrapper').show();
            console.log('Child product id:'+ItemId); 
            ReloadReactComponent(base_webhookurl, ibmOrgId, ItemId, countryId, postcode, ItemQty, accessToken,isLoggedin);
         });
         // Get child product id for cofig product for select swaches //
         jQuery(".product-options-wrapper select[id^='attribute']").last().on('change', function() {
            setTimeout(function (){
               var simpleProductId= $("input[name=selected_configurable_option]").val();
               ItemId = simpleProductId;
               jQuery('#react-component-wrapper').show();
               console.log('Child product id:'+ItemId); 

               ReloadReactComponent(base_webhookurl, ibmOrgId, ItemId, countryId, postcode, ItemQty, accessToken,isLoggedin);

            }, 500);  
        }); 

    }else{
        var ItemId = jQuery("input[name='item']").val();
    }
    
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
         getAlert= "1111"
        />
    </React.Suspense>, element);
}
}else {
    console.log("API data is empty.");
}
});


function ReloadReactComponent(base_webhookurl, ibmOrgId, ItemId, countryId, postcode, ItemQty, accessToken,isLoggedin) {
   
    if(isLoggedin === true && postcode!== 'undefined'){
    const elementDeliveryinfo = document.getElementById('root-pdp-react-delivery-time');
    const Deliveryinfo = React.lazy(() => import('delivery_time/index'));
    ReactDOM.render(<React.Suspense fallback={<div dangerouslySetInnerHTML={{ __html: elementDeliveryinfo.innerHTML }} />}>
        <Deliveryinfo originalContent={elementDeliveryinfo.innerHTML}
            buttonColor="#1a79c2"
            webhookURL={base_webhookurl}
            ibmOrganizationId={ibmOrgId}
            itemId={ItemId}
            country={countryId}
            zipCode={postcode}
            requiredQty={ItemQty}
            webhookAccessToken={accessToken} />
    </React.Suspense>, elementDeliveryinfo);
   }
    const elementSourceLocations = document.getElementById('root-pdp-react-selectsource');
    const SourceLocations = React.lazy(() => import('location_stock_availability/index'));
    ReactDOM.render(<React.Suspense fallback={<div dangerouslySetInnerHTML={{ __html: elementSourceLocations.innerHTML }} />}>
        <SourceLocations originalContent={elementSourceLocations.innerHTML}
            isSourceButtonShow={true}
            isInstoreButtonShow={false}
            webhookURL={base_webhookurl}
            webhookAccessToken={accessToken}
            itemId={ItemId}
            lineId="1"
            organizationId={ibmOrgId} />
    </React.Suspense>, elementSourceLocations);

    const elementDeliveryMethod = document.getElementById('root-pdp-react-select-delivery-method');
    const DeliveryMethod = React.lazy(() => import('delivery_method/index'));
    ReactDOM.render(<React.Suspense fallback={<div dangerouslySetInnerHTML={{ __html: elementDeliveryMethod.innerHTML }} />}>
        <DeliveryMethod originalContent={elementDeliveryMethod.innerHTML}
            webhookURL={base_webhookurl}
            webhookAccessToken={accessToken}
            itemId={ItemId}
            lineId="1"
            organizationId={ibmOrgId} />
    </React.Suspense>, elementDeliveryMethod);
}

