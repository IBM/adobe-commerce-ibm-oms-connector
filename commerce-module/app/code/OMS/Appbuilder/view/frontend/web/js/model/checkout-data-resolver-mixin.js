/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */

define([
    'underscore',
    'Magento_Checkout/js/checkout-data',
    'Magento_Checkout/js/action/select-shipping-method',
    'jquery'
],function (_, checkoutData, selectShippingMethodAction, $) {

    'use strict';

    return function (checkoutDataResolver) {
        var checkoutDataResolverShipping = checkoutDataResolver.resolveShippingRates;
       
        return _.extend(checkoutDataResolver, {
            resolveShippingRates: function (ratesData) {
                var selectedShippingRate = checkoutData.getSelectedShippingRate();
                var reactDeliveryMethod = localStorage.getItem('DELIVERY_METHOD');
                //$.cookie('reactDeliveryMethod', reactDeliveryMethod, {expires: 0.5}); // 0.5 days = 30 minutes
                if (!_.isUndefined(reactDeliveryMethod) &&
                    reactDeliveryMethod ==2 &&
                    !selectedShippingRate &&
                    ratesData &&
                    ratesData.length > 1
                ) {
                    console.log('pickup');
                    var defaultShipping = 'instore_pickup';
                    checkoutData.setSelectedShippingRate(defaultShipping);

                }
      
                 // Retrieve data from local storage
                    var selectedStoreData = JSON.parse(localStorage.getItem('SELECTED_STORE'));
                    console.log(selectedShippingRate);
                    //if (selectedStoreData){
                        //$.cookie('reactSelectedStore', selectedStoreData.source_code, {expires: 0.5}); // 0.5 days = 30 minutes
                    //}
                   
                if (selectedStoreData && selectedShippingRate=='instore_pickup') {
                    // Transform the data into the required format
                    var transformedData = {
                        postcode: selectedStoreData.postcode,
                        country_id: selectedStoreData.country_id,
                        region: selectedStoreData.region,
                        region_id: selectedStoreData.region_id,
                        region_code: selectedStoreData.region_code,
                        street: {
                            0: selectedStoreData.street,
                        },
                        telephone: selectedStoreData.phone,
                        city: selectedStoreData.city,
                        firstname: selectedStoreData.name,
                        lastname: '',
                        save_in_address_book: 0,
                        extension_attributes: {
                            pickup_location_code: selectedStoreData.source_code,
                        },
                    };
                    console.log('updated pickup store');
                    console.log(transformedData);
                    // Set the selected pickup address using checkoutData
                    checkoutData.setSelectedPickupAddress(transformedData);
                    checkoutData.setSelectedShippingAddress('store-pickup-address'+selectedStoreData.source_code);
                }
               
                return checkoutDataResolverShipping.apply(this, arguments);
            },
        });
    };
});
