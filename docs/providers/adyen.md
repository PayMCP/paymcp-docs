---
id: adyen
title: "Adyen Provider"
description: Accept global payments using Adyen's unified payment platform
---

# Adyen Provider

Adyen is a global payment platform supporting 250+ payment methods across 200+ countries. Trusted by major enterprises for high-volume, international payments.

## Features

- **Global Scale** - 250+ payment methods, 200+ countries
- **Enterprise Grade** - Used by major platforms (Uber, Spotify, etc.)
- **Unified Platform** - Online, mobile, and in-store payments
- **Advanced Routing** - Smart payment routing for higher success rates
- **Real-time Data** - Comprehensive analytics and reporting
- **Regulatory Compliance** - PCI DSS Level 1, local compliance

## Quick Setup

### 1. Get Adyen Credentials

1. Contact Adyen sales for account setup
2. Complete merchant onboarding process
3. Get your **API Key** and **Merchant Account**
4. Configure webhook endpoints

### 2. Configuration Options

PayMCP supports multiple ways to configure the Adyen provider:

#### Option 1: Config Mapping (Default)

```python
from paymcp import PayMCP, PaymentFlow

PayMCP(
    mcp,
    providers={
        "adyen": {
            "api_key": "YOUR_API_KEY",
            "merchant_account": "YOUR_MERCHANT_ACCOUNT",
            "return_url": "https://yourapp.com/return",
            "sandbox": True  # Use False for production
        }
    },
    payment_flow=PaymentFlow.TWO_STEP
)
```

#### Option 2: Provider Instance

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import AdyenProvider

adyen_provider = AdyenProvider(
    api_key="YOUR_API_KEY",
    merchant_account="YOUR_MERCHANT_ACCOUNT",
    return_url="https://yourapp.com/return",
    sandbox=True
)

PayMCP(
    mcp,
    providers={"adyen": adyen_provider},
    payment_flow=PaymentFlow.TWO_STEP
)
```

#### Option 3: List of Instances

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import AdyenProvider

PayMCP(
    mcp,
    providers=[
        AdyenProvider(
            api_key="YOUR_API_KEY",
            merchant_account="YOUR_MERCHANT_ACCOUNT",
            return_url="https://yourapp.com/return",
            sandbox=True
        )
    ],
    payment_flow=PaymentFlow.TWO_STEP
)
```

### 3. Test Your Integration

```python
@mcp.tool()
@price(amount=5.00, currency="EUR")
def adyen_test(product: str, ctx: Context) -> str:
    return f"Adyen payment successful for: {product}"
```

## Configuration Options

```python
providers = {
    "adyen": {
        "api_key": "YOUR_API_KEY",                    # Required
        "merchant_account": "YOUR_MERCHANT_ACCOUNT",  # Required  
        "return_url": "https://yourapp.com/return",   # Required
        "sandbox": True,                              # True for test environment
    }
}
```

## Supported Currencies & Payment Methods

### Global Currencies

Adyen supports 150+ currencies:

```python
@price(amount=1.00, currency="USD")   # US Dollars
@price(amount=1.50, currency="EUR")   # Euros
@price(amount=5.00, currency="GBP")   # British Pounds
@price(amount=10.00, currency="SGD")  # Singapore Dollars
@price(amount=100, currency="BRL")    # Brazilian Real
```

### Payment Methods by Region

- **Europe**: SEPA, iDEAL, Bancontact, Sofort
- **Asia**: Alipay, WeChat Pay, GrabPay, DANA
- **Americas**: ACH, PIX, OXXO, Boleto
- **Global**: Visa, Mastercard, PayPal, Apple Pay

## Testing

### Test Environment

Adyen provides comprehensive testing with all configuration methods:

```python
# Config mapping
providers = {
    "adyen": {
        "api_key": "YOUR_TEST_API_KEY",
        "merchant_account": "YOUR_TEST_MERCHANT_ACCOUNT",
        "return_url": "http://localhost:3000/return",
        "sandbox": True
    }
}

# Provider instance
from paymcp.providers import AdyenProvider
providers = [
    AdyenProvider(
        api_key="YOUR_TEST_API_KEY",
        merchant_account="YOUR_TEST_MERCHANT_ACCOUNT",
        return_url="http://localhost:3000/return",
        sandbox=True
    )
]
```

### Test Cards

| Card Number | Result |
|-------------|---------|
| `4111 1111 1111 1111` | Visa - Authorized |
| `4000 0000 0000 0002` | Visa - Declined |
| `5555 5555 5555 4444` | Mastercard - Authorized |

## Payment Flow

Adyen uses Pay-by-Link for MCP integration:

```python
PayMCP(mcp, providers={"adyen": {...}}, payment_flow=PaymentFlow.TWO_STEP)

@mcp.tool()
@price(amount=10.00, currency="USD")
def global_service(data: str, ctx: Context) -> str:
    return f"Global service completed for: {data}"
```

**User Experience:**
1. User calls tool → Gets Adyen payment link
2. User chooses payment method → Completes payment
3. User returns to app → Calls confirmation tool
4. Tool executes after payment verification

## Best Practices

### Multi-Currency Strategy

```python
# Let Adyen handle currency conversion
@price(amount=9.99, currency="USD")   # US market
@price(amount=8.99, currency="EUR")   # European market
@price(amount=899, currency="JPY")    # Japanese market
```

### Regional Payment Methods

```python
# Adyen automatically shows relevant payment methods
# based on user location and currency
@mcp.tool()
@price(amount=5.00, currency="EUR")
def european_service(data: str, ctx: Context) -> str:
    """
    Premium service - €5.00
    Accepts: Cards, PayPal, iDEAL, SEPA, Bancontact
    """
    return process_premium(data)
```

## Advantages

### For Global Businesses
- **Single Integration** - Access all payment methods globally
- **Higher Authorization Rates** - Smart routing technology
- **Regulatory Compliance** - Local compliance in each market
- **Unified Reporting** - Single dashboard for all markets

### For Developers
- **Comprehensive APIs** - Modern, well-documented APIs
- **Webhook System** - Real-time payment notifications
- **Testing Tools** - Extensive test environment
- **Support** - 24/7 technical support

## Enterprise Features

### Advanced Routing

Adyen automatically routes payments through the best path for highest success rates.

### Risk Management

Built-in fraud detection and risk scoring for all transactions.

### Reporting & Analytics

Comprehensive dashboards with real-time transaction data and insights.

## Production Setup

### Required Steps

1. **Account Verification** - Complete merchant verification
2. **Integration Testing** - Test all payment flows thoroughly  
3. **Webhook Configuration** - Set up payment notifications
4. **Go-Live Review** - Adyen technical review process
5. **Production Credentials** - Switch to live API keys

### Compliance

- **PCI DSS** - Level 1 compliance handled by Adyen
- **Local Regulations** - Automatic compliance in each market
- **Data Protection** - GDPR and regional privacy law compliance

## Troubleshooting

### Common Issues

**Payment method not available:**
- Check currency and country configuration
- Verify merchant account settings
- Ensure payment method is enabled

**Webhook not received:**
- Verify webhook URL is accessible
- Check webhook configuration in Adyen Customer Area
- Ensure proper authentication

**Authorization declined:**
- Check merchant account limits
- Verify currency support
- Review risk settings

## Migration Guide

### From Other Processors

```python
# Before: Regional payment processor
PayMCP(mcp, providers={"regional_provider": {...}})

# After: Adyen global platform
PayMCP(mcp, providers={"adyen": {...}})

# Same tools, global reach
```

## Support

- **Adyen Documentation**: [docs.adyen.com](https://docs.adyen.com)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)  
- **Adyen Support**: 24/7 technical support via Customer Area

## Next Steps

- **[Contact Adyen Sales](https://www.adyen.com/contact)** - Start account setup
- **[Integration Guide](../quickstart#testing-your-integration)** - Technical implementation
- **[Global Examples](../examples/premium-qa-bot)** - Multi-currency use cases
