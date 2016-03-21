<?php
namespace SimplePay\SimplePayGateway\Model\Ui;

use Magento\Checkout\Model\ConfigProviderInterface;
use Magento\Payment\Helper\Data as PaymentHelper;
use Magento\Store\Model\Store as Store;

/**
 * Class ConfigProvider
 */
final class ConfigProvider implements ConfigProviderInterface
{
    const CODE = 'simplepay_gateway';

    protected $method;

    public function __construct(
        PaymentHelper $paymentHelper,
        Store $store
    )
    {
        $this->method = $paymentHelper->getMethodInstance(self::CODE);
        $this->store = $store;
    }

    /**
     * Retrieve assoc array of checkout configuration
     *
     * @return array
     */
    public function getConfig()
    {
        $public_key = $this->method->getConfigData('live_public_api_key');
        if ($this->method->getConfigData('test_mode')) {
            $public_key = $this->method->getConfigData('test_public_api_key');
        }

        return [
            'payment' => [
                self::CODE => [
                    'public_key' => $public_key,
                    'image' => $this->method->getConfigData('image'),
                    'description' => $this->method->getConfigData('description'),
                    'api_url' => $this->store->getBaseUrl() . 'rest/'
                ]
            ]
        ];
    }
}
