/*browser:true*/
/*global define*/
define(
    [
        'uiComponent',
        'Magento_Checkout/js/model/payment/renderer-list'
    ],
    function (
        Component,
        rendererList
    ) {
        'use strict';
        rendererList.push(
            {
                type: 'simplepay_gateway',
                component: 'SimplePay_SimplePayGateway/js/view/payment/method-renderer/simplepay_gateway'
            }
        );
        /** Add view logic here if needed */
        return Component.extend({});
    }
);
