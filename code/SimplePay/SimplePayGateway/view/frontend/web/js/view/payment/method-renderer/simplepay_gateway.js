/*browser:true*/
/*global define*/

define(
    [
        'jquery',
        'Magento_Checkout/js/view/payment/default',
        'Magento_Checkout/js/action/place-order',
        'Magento_Checkout/js/model/payment/additional-validators',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/model/full-screen-loader',
        'Magento_Checkout/js/action/redirect-on-success'
    ],
    function ($, Component, placeOrderAction, additionalValidators, quote, fullScreenLoader, redirectOnSuccessAction) {
        'use strict';

        return Component.extend({
            defaults: {
                template: 'SimplePay_SimplePayGateway/payment/form',
                customObserverName: null
            },

            redirectAfterPlaceOrder: true,

            initialize: function () {
                this._super();

                // Add SimplePay Gateway script to head
                $("head").append('<script src="https://checkout.simplepay.ng/simplepay.js">');

                return this;
            },

            getCode: function () {
                return 'simplepay_gateway';
            },

            getData: function () {
                return {
                    'method': this.item.method,
                    'additional_data': {}
                };
            },

            /**
             * @override
             */

            placeOrder: function () {
                var checkoutConfig = window.checkoutConfig;
                var paymentData = quote.billingAddress();
                var simplePayConfiguration = checkoutConfig.payment.simplepay_gateway;
                
                if (checkoutConfig.isCustomerLoggedIn) {
                    var customerData = checkoutConfig.customerData;
                    paymentData.email = customerData.email;

                } else {
                    var storageData = JSON.parse(localStorage.getItem('mage-cache-storage'))['checkout-data'];
                    paymentData.email = storageData.validatedEmailValue;
                }

                var _this = this;
                var handler = SimplePay.configure({
                    token: function (token) {

                        $.ajax({
                            method: 'GET',
                            url: simplePayConfiguration.api_url + 'simplepay/verify/'+token,
                        }).success(function () {
                            
                            _this.processPayment();

                        });
                    },
                    key: simplePayConfiguration.public_key,
                    image: simplePayConfiguration.image
                });

                handler.open(SimplePay.CHECKOUT, {
                    email: paymentData.email,
                    phone: paymentData.telephone,
                    description: simplePayConfiguration.description,
                    address: paymentData.street[0] + ', ' + paymentData.street[1],
                    postal_code: paymentData.postcode,
                    city: paymentData.city,
                    country: paymentData.countryId,
                    amount: this.formatAmount(checkoutConfig.quoteData.grand_total),
                    currency: checkoutConfig.quoteData.store_currency_code
                });
            },

            processPayment: function () {
                var self = this,
                    placeOrder;

                if (this.validate() && additionalValidators.validate()) {
                    this.isPlaceOrderActionAllowed(false);
                    //placeOrder = placeOrderAction(this.getData(), this.redirectAfterPlaceOrder, this.messageContainer);
                    placeOrder = placeOrderAction(this.getData(), this.messageContainer);
                    $.when(placeOrder).fail(function () {
                        self.isPlaceOrderActionAllowed(true);
                    }).done(
                        function () {
                            self.afterPlaceOrder();

                            if (self.redirectAfterPlaceOrder) {
                                redirectOnSuccessAction.execute();
                            }
                        }
                    );

                    return true;
                } 
                

                return false;
            },

            
            /**
             *  SimplePay Gateway functions
             */
            // Format amount to lower domination
            formatAmount: function (amount) {
                var strAmount = amount.toString().split(".");
                var decimalPlaces = strAmount[1] === undefined ? 0 : strAmount[1].length;
                var formattedAmount = strAmount[0];

                if (decimalPlaces === 0) {
                    formattedAmount += '00';

                } else if (decimalPlaces === 1) {
                    formattedAmount += strAmount[1] + '0';

                } else if (decimalPlaces === 2) {
                    formattedAmount += strAmount[1];

                } else if (decimalPlaces > 2) {
                    formattedAmount += strAmount[1].slice(0, 2);

                }

                return formattedAmount;
            }
        });
    }
)
;
