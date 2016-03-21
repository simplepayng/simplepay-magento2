<?php
namespace SimplePay\SimplePayGateway\Api;

interface PaymentInterface
{
    /**
     * @param string $token
     * @return bool
     */
    public function verifyPayment(
        $token
    );
}