/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
require([
    'jquery',
    'Magento_Checkout/js/checkout-data'
], function ($, checkoutData) {
    'use strict';

    // Function to update selected shipping rate
    function updateSelectedShippingRate(rateCode) {
        checkoutData.setSelectedShippingRate(rateCode);
    }

    $(document).ready(function () {
        console.log('Home delivery set');
        updateSelectedShippingRate(null);
        $(document).on('click', 'input[type=radio]', function() {
            console.log('Delivery method clicked');
            // Get the clicked radio button
            var clickedDeliveryMethod = $(this);
    
            if (clickedDeliveryMethod.is('#1')) {
                // When radio with id 1 is selected, set shipping rate to null
                updateSelectedShippingRate(null);
                console.log('Home delivery click');
            } else if (clickedDeliveryMethod.is('#2')) {
                // When radio with id 2 is selected, set shipping rate to 'instore_pickup'
                updateSelectedShippingRate('instore_pickup');
                console.log('Store pickup click');
            }
        });
    });

    return {
        
    };
});
