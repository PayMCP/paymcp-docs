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

## Support

- **Adyen Documentation**: [docs.adyen.com](https://docs.adyen.com)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)  
- **Adyen Support**: 24/7 technical support via Customer Area

