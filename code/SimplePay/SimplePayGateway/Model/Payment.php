<?php
namespace SimplePay\SimplePayGateway\Model;

use Magento\Payment\Helper\Data as PaymentHelper;

class Payment implements \SimplePay\SimplePayGateway\Api\PaymentInterface
{
    const CODE = 'simplepay_gateway';

    protected $config;

    public function __construct(
        PaymentHelper $paymentHelper
    )
    {
        $this->config = $paymentHelper->getMethodInstance(self::CODE);
    }

    /**
     * @return bool
     */
    public function verifyPayment($token)
    {
        $privateKey = $this->config->getConfigData('live_private_api_key');
        if ($this->config->getConfigData('test_mode')) {
            $privateKey = $this->config->getConfigData('test_private_api_key');
        } 

        
        $data = array(
            'token' => $token
        );

        $dataString = json_encode($data);

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, 'https://checkout.simplepay.ng/v1/payments/verify/');
        curl_setopt($ch, CURLOPT_USERPWD, $privateKey . ':');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataString);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($dataString)
        ));

        $curlResponse = curl_exec($ch);
        $curlResponse = preg_split("/\r\n\r\n/", $curlResponse);
        $responseContent = $curlResponse[1];
        $jsonResponse = json_decode(chop($responseContent), true);
        $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        curl_close($ch);

        if ($responseCode == '200' && $jsonResponse['response_code'] == '20000') {
            return true;

        }
        
        return false;
    }
}