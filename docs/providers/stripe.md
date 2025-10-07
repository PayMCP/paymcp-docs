---
id: stripe
title: "Stripe Provider"
description: Complete guide to integrating Stripe payments with PayMCP
---

# Stripe Provider

Stripe is one of the most popular payment processors globally, supporting credit cards, ACH transfers, and international payments in 40+ countries.

## Features

- **Global Coverage** - Accept payments in 135+ currencies
- **Payment Methods** - Cards, bank transfers, digital wallets


## Quick Setup

### 1. Get Your API Keys

1. Sign up at [stripe.com](https://stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Secret Key** (starts with `sk_test_` for testing)

### 2. Configuration Options

PayMCP supports multiple ways to configure the Stripe provider:

#### Option 1: Config Mapping (Default)

<details>
<summary>Python</summary>

```python
from paymcp import PayMCP, PaymentFlow

PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": "sk_test_51...",  # Your secret key
            "success_url": "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://yourapp.com/cancel"
        }
    },
    payment_flow=PaymentFlow.TWO_STEP
)
```

</details>

<details>
<summary>JavaScript/TypeScript</summary>

```typescript
import { PayMCP, PaymentFlow } from 'paymcp';

new PayMCP(
    mcp,
    {
        providers: {
            "stripe": {
                apiKey: "sk_test_51...",  // Your secret key
                success_url: "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: "https://yourapp.com/cancel"
            }
        },
        payment_flow: PaymentFlow.TWO_STEP
    }
);
```

</details>

#### Option 2: Provider Instance

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import StripeProvider

stripe_provider = StripeProvider(
    apiKey="sk_test_51...",
    success_url="https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url="https://yourapp.com/cancel"
)

PayMCP(
    mcp,
    providers={"stripe": stripe_provider},
    payment_flow=PaymentFlow.TWO_STEP
)
```

#### Option 3: List of Instances

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import StripeProvider

PayMCP(
    mcp,
    providers=[
        StripeProvider(
            apiKey="sk_test_51...",
            success_url="https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://yourapp.com/cancel"
        )
    ],
    payment_flow=PaymentFlow.TWO_STEP
)
```

### 3. Test Your Integration

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
def test_tool(message: str, ctx: Context) -> str:
    """Tool description"""
    # Your code goes here
    return f"Here is your result: {message}"
```

Test with Stripe's test card: `4242 4242 4242 4242`

## Advanced Configuration

### Custom Success/Cancel URLs

Stripe supports dynamic URL parameters:

```python
PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": "sk_live_...",
            "success_url": "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}&tool={TOOL_NAME}",
            "cancel_url": "https://yourapp.com/cancel?reason=user_cancelled"
        }
    }
)
```

Available parameters:
- `{CHECKOUT_SESSION_ID}` - Stripe session ID
- `{TOOL_NAME}` - Name of the MCP tool being purchased


## Testing

### Test Cards

Stripe provides comprehensive test cards:

| Card Number | Description |
|-------------|-------------|
| `4242424242424242` | Visa - Success |
| `4000000000000002` | Visa - Declined |
| `4000000000009995` | Visa - Insufficient funds |
| `4000000000009987` | Visa - Lost card |
| `4000002500003155` | Visa - Requires authentication |


### Development vs Production

You can use any configuration method for both development and production:

```python
from paymcp.providers import StripeProvider

# Development (sandbox) - Config mapping
dev_providers = {
    "stripe": {
        "apiKey": "sk_test_51...",  # Test key
        "success_url": "http://your custom_url/success?session_id={CHECKOUT_SESSION_ID}",
        "cancel_url": "http://your custom_url/cancel"
    }
}

# Development (sandbox) - Provider instance
dev_providers = [
    StripeProvider(
        apiKey="sk_test_51...",
        success_url="http://your custom_url/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="http://your custom_url/cancel"
    )
]

# Production - Config mapping
prod_providers = {
    "stripe": {
        "apiKey": "sk_live_51...",  # Live key
        "success_url": "https://your custom_url/success?session_id={CHECKOUT_SESSION_ID}",
        "cancel_url": "https://your custom_url/cancel"
    }
}

# Production - Provider instance
prod_providers = [
    StripeProvider(
        apiKey="sk_live_51...",
        success_url="https://your custom_url/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="https://your custom_url/cancel"
    )
]
```

## Error Handling

Common Stripe errors and solutions:

### Invalid API Key

```python
# Error: "Invalid API key provided"
# Solution: Check your API key format and permissions
providers = {
    "stripe": {
        "apiKey": "sk_test_51..."  # Must start with sk_test_ or sk_live_
    }
}
```

### Payment Declined

```python
# PayMCP automatically handles declined payments
# Returns appropriate error messages to the user
@mcp.tool()
@price(amount=10.00, currency="USD")
def expensive_operation(data: str, ctx: Context) -> str:
    # This will only execute if payment succeeds
    return process_data(data)
```

### Rate Limiting

Stripe has rate limits. PayMCP handles retries automatically:

```python
# PayMCP includes built-in retry logic
# No additional configuration needed
```

## Best Practices

### Security

- **Never expose secret keys** in client-side code
- **Use test keys** during development
- **Validate webhook signatures** to prevent spoofing

### User Experience

```python
# Good: Clear pricing and descriptions
@price(amount=0.25, currency="USD")
def grammar_check(text: str, ctx: Context) -> str:
    """Check grammar and spelling - $0.25 per check"""
    return corrected_text

# Better: Bulk pricing for better value
@price(amount=2.00, currency="USD")
def grammar_check_bulk(texts: list[str], ctx: Context) -> list[str]:
    """Bulk grammar check - $2.00 for up to 50 texts"""
    return [correct_text(t) for t in texts[:50]]
```



### Debug Mode

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# PayMCP will log all Stripe API interactions
```

## Migration Guide

### From Direct Stripe Integration

If you're already using Stripe directly:

```python
# Before: Direct Stripe
import stripe
stripe.api_key = "sk_test_..."
session = stripe.checkout.Session.create(...)

# After: PayMCP + Stripe
from paymcp import PayMCP, price
PayMCP(mcp, providers={"stripe": {"apiKey": "sk_test_..."}})

@price(amount=1.00, currency="USD")
def my_tool(input: str, ctx: Context) -> str:
    return process(input)
```

### From Other Providers

PayMCP makes switching providers easy:

```python
# Just change the provider configuration
# Your tools stay exactly the same

# Old provider
PayMCP(mcp, providers={"old_provider": {...}})

# New: Stripe
PayMCP(mcp, providers={"stripe": {"apiKey": "sk_test_..."}})
```

## Next Steps

- **[Test Integration](../quickstart#testing-your-integration)** - Verify your setup
- **[Payment Flows](../concepts-and-flows)** - Choose the right flow
- **[Examples](../examples/paid-image-generator)** - See Stripe in action
- **[API Reference](../api-reference)** - Detailed parameter docs

## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)
- **Stripe Support**: Available in your Stripe Dashboard
