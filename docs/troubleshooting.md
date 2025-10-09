---
id: troubleshooting
title: "Troubleshooting & FAQ"
description: Common issues, solutions, and frequently asked questions about PayMCP
---

# Troubleshooting & FAQ

Common issues, solutions, and frequently asked questions about PayMCP.


### STDIO Mode Deployment Error

**Error**: STDIO mode disabled by PayMCP

**Why this is dangerous**: STDIO mode requires distributing your server (including API keys) to end users, exposing sensitive payment credentials.

**Solution**: Always use hosted deployment

## Quick Fixes

### Tool Not Found Error

**Error**: `Tool 'my_tool' not found` or similar MCP errors

**Solution**: Include `ctx: Context` parameter:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
# ❌ Wrong
@price(amount=0.50, currency="USD")
def process_user_input(input: str) -> str:
    return "result"

# ✅ Correct
@price(amount=0.50, currency="USD")
def process_user_input(input: str, ctx: Context) -> str:
    """Process user input and return result"""
    return "result"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// ❌ Wrong
server.registerTool("process_user_input", {
  price: { amount: 0.50, currency: "USD" }
}, async ({ input }) => {
  return { content: [{ type: "text", text: "result" }] };
});

// ✅ Correct
server.registerTool("process_user_input", {
  description: "Process user input and return result",
  price: { amount: 0.50, currency: "USD" }
}, async ({ input }, ctx) => {
  return { content: [{ type: "text", text: "result" }] };
});
```

</TabItem>
</Tabs>

### Provider Authentication Error

**Error**: `Invalid API key` or `Authentication failed`

**Solutions**:
1. **Check API key format**:
   - Stripe: Should start with `sk_test_` or `sk_live_`
   - Walleot: Should start with `wk_test_` or `wk_live_`
   - PayPal: Check client ID and secret format

2. **Verify environment variables**:

<Tabs>
<TabItem value="python" label="Python">

```python
import os
print(f"Stripe key: {os.getenv('STRIPE_SECRET_KEY')[:10]}...")  # Check first 10 chars
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
console.log(`Stripe key: ${process.env.STRIPE_SECRET_KEY?.substring(0, 10)}...`);
```

</TabItem>
</Tabs>

3. **Check provider dashboard**:
   - Ensure API key is active
   - Verify permissions are correct
   - Check account status



## Common Integration Issues

### Missing Context Parameter

PayMCP requires all priced tools to include `ctx: Context`:

```python
from mcp.server.fastmcp import Context

# This is required for PayMCP to work
@price(amount=1.00, currency="USD")
def tool_with_context(input: str, ctx: Context) -> str:
    return "success"
```

**Why is this required?**
- User identification for payment tracking
- Progress reporting (PROGRESS flow)
- Elicitation support (ELICITATION flow)

### Import Errors

**Error**: `ModuleNotFoundError: No module named 'paymcp'`

**Solution**: Install PayMCP:
```bash
pip install paymcp

# Note: WebView functionality removed for security reasons
```

### Version Compatibility

**Error**: Incompatible versions between PayMCP and MCP

**Solution**: Check version compatibility:
```python
import paymcp
import mcp
print(f"PayMCP: {paymcp.__version__}")
print(f"MCP: {mcp.__version__}")
```

### Provider Import Errors

**Error**: `ImportError: cannot import name 'StripeProvider' from 'paymcp.providers'`

**Solution**: Ensure you're using the latest PayMCP version for provider instances:

<Tabs>
<TabItem value="python" label="Python">

```python
# Check version first
import paymcp
print(f"PayMCP version: {paymcp.__version__}")

# Then import provider classes
from paymcp.providers import StripeProvider, WalleotProvider
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// Check version first
import paymcp from 'paymcp';
console.log(`PayMCP version: ${paymcp.version}`);

// Then import provider classes
import { StripeProvider, WalleotProvider } from 'paymcp/providers';
```

</TabItem>
</Tabs>

### Provider Configuration Type Errors

**Error**: `TypeError: Provider must be an instance of BasePaymentProvider`

**Solution**: Ensure custom providers inherit from BasePaymentProvider:

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import BasePaymentProvider

class MyProvider(BasePaymentProvider):
    def create_payment(self, amount: float, currency: str, description: str):
        return "payment_id", "https://example.com/pay"
    
    def get_payment_status(self, payment_id: str) -> str:
        return "paid"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { BasePaymentProvider } from 'paymcp/providers';

class MyProvider extends BasePaymentProvider {
    createPayment(amount: number, currency: string, description: string): [string, string] {
        return ["payment_id", "https://example.com/pay"];
    }
    
    getPaymentStatus(paymentId: string): string {
        return "paid";
    }
}
```

</TabItem>
</Tabs>


## Payment Flow Issues

### ELICITATION Not Working

**Error**: `Elicitation not supported` or hangs indefinitely

**Cause**: MCP client doesn't support elicitation

**Solution**: Use TWO_STEP flow instead:
```python
PayMCP(
    mcp,
    providers={...},
    payment_flow=PaymentFlow.TWO_STEP  # More compatible
)
```

### PROGRESS Flow Timeout

**Error**: `Payment timeout reached; aborting`

**Cause**: User didn't complete payment within timeout set by client

**Solution**:
- Inform users about time limit



## Development Issues

### Local Testing Problems

#### HTTPS Required Error

**Error**: Provider requires HTTPS but testing locally

**Solution**: Use ngrok or similar for HTTPS tunnel:
```bash
# Install ngrok
npm install -g ngrok

# Create HTTPS tunnel
ngrok http 3000

# Use ngrok URL in provider configuration
```


### Environment Setup

#### Missing Environment Variables

**Error**: `NoneType` errors when accessing API keys

**Solution**: Use environment file:
```bash
# .env file
STRIPE_SECRET_KEY=sk_test_...
WALLEOT_API_KEY=wk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Load in Python
from dotenv import load_dotenv
load_dotenv()
```

## Configuration Issues

### Configuration Problems

**Error**: `TypeError: build_providers expects a mapping or an iterable of provider instances`

**Solution**: Use the canonical provider list format:

<Tabs>
<TabItem value="python" label="Python">

```python
# ✅ Correct
from paymcp.providers import StripeProvider
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// ✅ Correct
import { StripeProvider } from 'paymcp/providers';
new PayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });
```

</TabItem>
</Tabs>

### Class Path Configuration Errors

**Error**: `ValueError: Unknown provider: custom`

**Solution**: Use proper class path or register provider:
```python
# Option 1: Use class path in config
PayMCP(mcp, providers={
    "custom": {
        "class": "my_package.providers:MyProvider",
        "api_key": "..."
    }
})

# Option 2: Register provider first
from paymcp.providers import register_provider
register_provider("custom", MyProvider)

PayMCP(mcp, providers={
    "custom": {"api_key": "..."}
})
```

### Provider Registration Issues

**Error**: `ValueError: name must be a non-empty string`

**Solution**: Provide valid name when registering:
```python
from paymcp.providers import register_provider

# ❌ Wrong
register_provider("", MyProvider)  # Empty name
register_provider(None, MyProvider)  # None name

# ✅ Correct
register_provider("my-gateway", MyProvider)
```

## Frequently Asked Questions

### General

**Q: Can I use multiple payment providers simultaneously?**
A: Yes! PayMCP supports multiple configuration methods. PayMCP currently uses the first configured provider.

**Q: How do I configure providers?**
A: Use the canonical format: `providers=[StripeProvider(apiKey="...")]`

**Q: Can I use PayMCP with STDIO mode (local MCP servers)?**
A: **NO - This is a critical security vulnerability.** STDIO mode would expose your payment provider API keys to end users. PayMCP requires hosted deployment where you control the server environment and API keys remain secure.

**Q: How do I deploy PayMCP securely?**
A: Deploy PayMCP on your own infrastructure (AWS, GCP, Heroku, etc.) where:
- You control the server environment
- API keys are stored securely as environment variables
- Users connect via HTTP/WebSocket protocols
- No sensitive credentials are distributed to users

**Q: What's the minimum payment amount?**
A: Depends on the provider:
- Stripe: $0.50 USD minimum
- PayPal: $0.01 USD minimum  
- Walleot: No minimum
- Square: $1.00 USD minimum

**Q: Are payments refundable?**
A: Yes, but refund handling depends on your business logic. PayMCP doesn't automatically refund failed tool executions.

### Technical




### Business

**Q: What are the typical fees?**
A: Provider fees vary:
- Stripe: 2.9% + $0.30 per transaction
- PayPal: 2.9% + fixed fee
- Walleot: ~1% (crypto payments)
- Square: 2.9% + $0.30
- Adyen: Custom enterprise pricing


## Getting Help

### Debug Mode

Enable detailed logging for troubleshooting:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# PayMCP will log:
# - Provider API calls and responses
# - Payment flow decisions
# - Error details and stack traces
```

### Support Channels

1. **GitHub Issues**: [PayMCP Issues](https://github.com/PayMCP/paymcp/issues)
2. **Documentation**: This documentation site
3. **Provider Support**: 
   - Use provider specific channels
   
### Reporting Bugs

When reporting issues, include:

1. **PayMCP version**: `paymcp.__version__`
2. **MCP version**: `mcp.__version__` 
3. **Provider**: Which provider you're using
4. **Payment flow**: TWO_STEP, ELICITATION, etc.
5. **Error messages**: Full error text and stack traces
6. **Code sample**: Minimal reproducible example

### Feature Requests

Feature requests are welcome! Consider:
- **Use case description**: What are you trying to achieve?
- **Provider support**: Does your preferred provider support it?
- **Backward compatibility**: Should it work with existing code?
- **Priority**: How important is this for your use case?

## Next Steps

- **[Back to Quickstart](./quickstart)** - If you're just getting started
- **[Provider Guides](./providers/stripe)** - Provider-specific help
- **[Examples](./examples/paid-image-generator)** - Working code examples
- **[API Reference](./api-reference)** - Detailed parameter documentation


