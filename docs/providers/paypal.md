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

### 2. Configuration Options

PayMCP supports multiple ways to configure the PayPal provider:

#### Option 1: Config Mapping (Default)

```python
from paymcp import PayMCP, PaymentFlow

PayMCP(
    mcp,
    providers={
        "paypal": {
            "client_id": "YOUR_CLIENT_ID",
            "client_secret": "YOUR_CLIENT_SECRET",
            "sandbox": True,  # Use False for production
            "success_url": "https://yourapp.com/success",
            "cancel_url": "https://yourapp.com/cancel"
        }
    },
    payment_flow=PaymentFlow.TWO_STEP  # Recommended for PayPal
)
```

#### Option 2: Provider Instance

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import PayPalProvider

paypal_provider = PayPalProvider(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    sandbox=True,
    success_url="https://yourapp.com/success",
    cancel_url="https://yourapp.com/cancel"
)

PayMCP(
    mcp,
    providers={"paypal": paypal_provider},
    payment_flow=PaymentFlow.TWO_STEP
)
```

#### Option 3: List of Instances

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import PayPalProvider

PayMCP(
    mcp,
    providers=[
        PayPalProvider(
            client_id="YOUR_CLIENT_ID",
            client_secret="YOUR_CLIENT_SECRET",
            sandbox=True,
            success_url="https://yourapp.com/success",
            cancel_url="https://yourapp.com/cancel"
        )
    ],
    payment_flow=PaymentFlow.TWO_STEP
)
```

### 3. Test Your Integration

```python
@mcp.tool()
@price(amount=1.00, currency="USD")
def paypal_test(message: str, ctx: Context) -> str:
    return f"PayPal payment successful! Message: {message}"
```

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

## Supported Currencies

PayPal supports 25+ currencies including:

```python
@price(amount=1.00, currency="USD")   # US Dollars
@price(amount=1.50, currency="EUR")   # Euros  
@price(amount=5.00, currency="GBP")   # British Pounds
@price(amount=10.00, currency="CAD")  # Canadian Dollars
@price(amount=100, currency="JPY")    # Japanese Yen
@price(amount=50.00, currency="AUD")  # Australian Dollars
```

See [PayPal's currency support](https://developer.paypal.com/docs/reports/reference/paypal-supported-currencies/) for the complete list.

## Payment Flow

PayPal works best with the **TWO_STEP** flow:

```python
PayMCP(mcp, providers={"paypal": {...}}, payment_flow=PaymentFlow.TWO_STEP)

@mcp.tool()
@price(amount=2.99, currency="USD")
def premium_feature(data: str, ctx: Context) -> str:
    return f"Premium processing completed for: {data}"
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

### API Errors

```python
# PayMCP handles PayPal API errors:
# - Invalid credentials
# - Rate limiting
# - Service downtime
# - Network timeouts
```

## Best Practices

### User Experience

```python
# Clear PayPal messaging
@mcp.tool()
@price(amount=1.99, currency="USD")
def paypal_tool(input: str, ctx: Context) -> str:
    """
    Premium analysis - $1.99
    Pay securely with PayPal, credit card, or bank transfer
    """
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
- [ ] Configure webhook endpoints (optional)
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

### Common Issues

**"Access denied" errors:**
- Verify client ID and secret are correct
- Check app permissions in PayPal Developer Console
- Ensure app is configured for payments

**Payments not completing:**
- Verify success_url is accessible
- Check for PayPal account limitations
- Ensure proper webhook configuration

**Currency errors:**
- Check if currency is supported in your region
- Verify account currency settings
- Some currencies require business verification

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
