---
id: paypal
title: "PayPal Provider"
description: Accept payments via PayPal balance, credit cards, and bank transfers worldwide
---

# PayPal Provider

PayPal enables payments from PayPal balance, credit cards, and bank transfers. With 400+ million active users worldwide, PayPal offers broad payment method coverage and trusted checkout experience.

## Features

- **400M+ Users** - Access PayPal's massive user base
- **Multiple Payment Methods** - PayPal balance, cards, bank transfers
- **Global Coverage** - Available in 200+ countries
- **Trusted Brand** - Users trust PayPal checkout
- **Buyer Protection** - Built-in purchase protection
- **Mobile Optimized** - Excellent mobile payment experience

## Quick Setup

### 1. Create PayPal App

1. Go to [PayPal Developer Console](https://developer.paypal.com)
2. Create a new app for your integration
3. Note your **Client ID** and **Client Secret**
4. Configure return URLs for your domain

### 2. Configuration

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import PayPalProvider

PayMCP(mcp, providers=[
    PayPalProvider(
        client_id="YOUR_CLIENT_ID",
        client_secret="YOUR_CLIENT_SECRET",
        sandbox=True
    )
])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { PayPalProvider } from 'paymcp/providers';

new PayMCP(mcp, { 
    providers: [
        new PayPalProvider({
            client_id: "YOUR_CLIENT_ID",
            client_secret: "YOUR_CLIENT_SECRET",
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
@price(amount=1.00, currency="USD")
def test_paypal_payment(message: str, ctx: Context) -> str:
    """Test PayPal payment integration"""
    return f"PayPal payment successful! Message: {message}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
server.registerTool(
  "test_paypal_payment",
  {
    description: "Test PayPal payment integration",
    inputSchema: { message: z.string() },
    price: { amount: 1.00, currency: "USD" },
  },
  async ({ message }, ctx) => {
    return { content: [{ type: "text", text: `PayPal payment successful! Message: ${message}` }] };
  }
);
```

</TabItem>
</Tabs>

## Configuration Options

### Required Parameters

```python
providers = {
    "paypal": {
        "client_id": "YOUR_CLIENT_ID",      # From PayPal Developer Console
        "client_secret": "YOUR_CLIENT_SECRET", # From PayPal Developer Console
        "sandbox": True,                     # True for testing, False for production
    }
}
```

### Optional Parameters

```python
providers = {
    "paypal": {
        "client_id": "YOUR_CLIENT_ID",
        "client_secret": "YOUR_CLIENT_SECRET",
        "sandbox": False,  # Production mode
        "success_url": "https://yourapp.com/success",
        "cancel_url": "https://yourapp.com/cancel",
    }
}
```



**User Experience:**
1. User calls tool → Gets PayPal checkout URL
2. User clicks "Pay with PayPal" → PayPal login/payment
3. User returns → Calls confirmation tool
4. Tool executes after payment verification

## Testing

### Sandbox Environment

PayPal provides a complete sandbox for testing with all configuration methods:

```python
# Config mapping
providers = {
    "paypal": {
        "client_id": "YOUR_SANDBOX_CLIENT_ID",
        "client_secret": "YOUR_SANDBOX_CLIENT_SECRET", 
        "sandbox": True,  # Important: enables sandbox mode
        "success_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    }
}

# Provider instance
from paymcp.providers import PayPalProvider
providers = [
    PayPalProvider(
        client_id="YOUR_SANDBOX_CLIENT_ID",
        client_secret="YOUR_SANDBOX_CLIENT_SECRET",
        sandbox=True,
        success_url="http://localhost:3000/success",
        cancel_url="http://localhost:3000/cancel"
    )
]
```

### Test Accounts

Create test accounts in PayPal Developer Console:
- **Personal Account** - For testing buyer experience
- **Business Account** - For receiving payments
- **Credit Card Account** - For testing card payments

### Test Scenarios

```python
# Test different amounts
@price(amount=0.01, currency="USD")  # Minimum amount
@price(amount=10.00, currency="USD") # Standard amount
@price(amount=999.99, currency="USD") # Large amount

# Test different currencies
@price(amount=1.00, currency="EUR")  # Euro payments
@price(amount=5.00, currency="GBP")  # Pound payments
```

## Error Handling

PayMCP automatically handles common PayPal errors:

### Payment Declined

```python
# PayMCP returns clear error messages for:
# - Insufficient funds
# - Invalid payment method
# - Account limitations
# - Currency restrictions
```

### Order Cancellation

```python
# If user cancels PayPal payment:
# - Returns to cancel_url
# - Tool is not executed
# - Clear messaging to user about cancellation
```


## Best Practices

### User Experience

```python
# Clear PayPal messaging
@mcp.tool()
@price(amount=1.99, currency="USD")
def analyze_premium_content(input: str, ctx: Context) -> str:
    """Analyze content using premium AI features"""
    return analyze_premium(input)
```

### Pricing Strategy

```python
# PayPal users expect familiar pricing
@price(amount=0.99, currency="USD")   # Micro-payment
@price(amount=4.99, currency="USD")   # Standard feature
@price(amount=19.99, currency="USD")  # Premium service
```

### Success/Cancel URLs

```python
# Configure meaningful return URLs
providers = {
    "paypal": {
        # ...
        "success_url": "https://yourapp.com/payment-success?tool={TOOL_NAME}",
        "cancel_url": "https://yourapp.com/payment-cancelled",
    }
}
```

## Production Checklist

Before going live with PayPal:

- [ ] Switch to production credentials (`sandbox: False`)
- [ ] Update success/cancel URLs to production domains
- [ ] Test with small real amounts
- [ ] Verify account verification status
- [ ] Review PayPal's acceptable use policy

## Advantages

### For Users
- **Trusted Brand** - Familiar PayPal experience
- **No Registration** - Can pay with credit card without PayPal account
- **Buyer Protection** - PayPal's purchase protection
- **Mobile Optimized** - Excellent mobile experience

### For Developers
- **Easy Integration** - Simple API setup
- **Global Reach** - 200+ countries supported
- **Multiple Payment Methods** - Balance, cards, banks
- **Instant Status** - Real-time payment confirmation

## Limitations

- **Fees** - Higher fees compared to some alternatives (2.9% + fixed fee)
- **Account Holds** - PayPal may hold funds for new merchants
- **Disputes** - Buyers can dispute payments
- **Currency Conversion** - PayPal handles conversion with their rates

## Troubleshooting


### Debug Mode

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# PayMCP will log PayPal API calls and responses
```

## Migration Guide

### From Direct PayPal Integration

```python
# Before: Direct PayPal SDK
import paypalrestsdk
paypalrestsdk.configure({...})
payment = paypalrestsdk.Payment({...})

# After: PayMCP + PayPal  
from paymcp import PayMCP, price
PayMCP(mcp, providers={"paypal": {...}})

@price(amount=1.00, currency="USD")
def my_tool(input: str, ctx: Context) -> str:
    return process(input)
```

## Next Steps

- **[Test Integration](../quickstart#testing-your-integration)** - Set up sandbox testing
- **[Payment Flows](../concepts-and-flows#two_step-flow)** - Understand PayPal flow
- **[Examples](../examples/premium-qa-bot)** - See PayPal in real examples

## Support

- **PayPal Developer Docs**: [developer.paypal.com](https://developer.paypal.com)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)
- **PayPal Developer Support**: Available in Developer Console
