/**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
var config = {
    config: {
        mixins: {
            'Magento_Checkout/js/model/checkout-data-resolver': {
                'OMS_Appbuilder/js/model/checkout-data-resolver-mixin': true
            }
        },
        map: {
            '*': {
                'setShippingRateCheckout': 'OMS_Appbuilder/js/setshippingrate-checkout'
            }
        }
    }
};
