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

### 2. Configuration

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import AdyenProvider

PayMCP(mcp, providers=[
    AdyenProvider(
        api_key="YOUR_API_KEY",
        merchant_account="YOUR_MERCHANT_ACCOUNT",
        sandbox=True
    )
])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { AdyenProvider } from 'paymcp/providers';

new PayMCP(mcp, { 
    providers: [
        new AdyenProvider({
            api_key: "YOUR_API_KEY",
            merchant_account: "YOUR_MERCHANT_ACCOUNT",
            sandbox: true
        })
    ] 
});
```

</TabItem>
</Tabs>

### 3. Test Your Integration

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=5.00, currency="EUR")
def test_adyen_payment(product: str, ctx: Context) -> str:
    """Test Adyen payment integration"""
    return f"Adyen payment successful for: {product}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
server.registerTool(
  "test_adyen_payment",
  {
    description: "Test Adyen payment integration",
    inputSchema: { product: z.string() },
    price: { amount: 5.00, currency: "EUR" },
  },
  async ({ product }, ctx) => {
    return { content: [{ type: "text", text: `Adyen payment successful for: ${product}` }] };
  }
);
```

</TabItem>
</Tabs>

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
def process_global_data(data: str, ctx: Context) -> str:
    """Process data using global service"""
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
def process_european_data(data: str, ctx: Context) -> str:
    """Process data using European payment methods"""
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
4. **Go-Live Review** - Adyen technical review process
5. **Production Credentials** - Switch to live API keys

### Compliance

- **PCI DSS** - Level 1 compliance handled by Adyen
- **Local Regulations** - Automatic compliance in each market
- **Data Protection** - GDPR and regional privacy law compliance

## Troubleshooting


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
