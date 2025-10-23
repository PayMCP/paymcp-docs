---
id: troubleshooting
title: "Troubleshooting"
description: Common issues and solutions for PayMCP
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Troubleshooting

Quick fixes for the most common PayMCP issues.

## STDIO Mode Deployment Error

**Error**: STDIO mode disabled by PayMCP

**Why this is dangerous**: STDIO mode requires distributing your server (including API keys) to end users, exposing sensitive payment credentials.

**Solution**: Always use hosted deployment

## Common Issues

### Tool Not Found Error

**Error**: `Tool 'my_tool' not found` or similar MCP errors

**Solution**: Include `ctx: Context` parameter:

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
mcp.tool("process_user_input", {
  price: { amount: 0.50, currency: "USD" }
}, async ({ input }) => {
  return { content: [{ type: "text", text: "result" }] };
});

// ✅ Correct
mcp.tool("process_user_input", {
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
   - Walleot: Should start with `sk_test_` or `sk_live_`
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

### Import Errors

**Error**: `ModuleNotFoundError: No module named 'paymcp'`

**Solution**: Install PayMCP:

<Tabs>
<TabItem value="python" label="Python">

```bash
pip install paymcp
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```bash
npm install paymcp
```

</TabItem>
</Tabs>

### Provider Import Errors

**Error**: `ImportError: cannot import name 'StripeProvider' from 'paymcp.providers'`

**Solution**: Ensure you're using the latest PayMCP version:

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
installPayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });
```

</TabItem>
</Tabs>

### Missing Environment Variables

**Error**: `NoneType` errors when accessing API keys

**Solution**: Use environment file:

<Tabs>
<TabItem value="python" label="Python">

```bash
# .env file
STRIPE_SECRET_KEY=sk_test_...
WALLEOT_API_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Load in Python
from dotenv import load_dotenv
load_dotenv()
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```bash
# .env file
STRIPE_SECRET_KEY=sk_test_...
WALLEOT_API_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Load in Node.js
import dotenv from 'dotenv';
dotenv.config();
```

</TabItem>
</Tabs>

## Payment Flow Issues

### ELICITATION Not Working

**Error**: `Elicitation not supported` or hangs indefinitely

**Cause**: MCP client doesn't support elicitation

**Solution**: Use TWO_STEP flow instead:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(
    mcp,
    providers={...},
    payment_flow=PaymentFlow.TWO_STEP  # More compatible
)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, {
    providers: {...},
    payment_flow: PaymentFlow.TWO_STEP  // More compatible
});
```

</TabItem>
</Tabs>

### DYNAMIC_TOOLS Tool List Not Updating

**Error**: Confirmation tool never appears or tool list remains unchanged

**Cause**: MCP client doesn't send `listChanged` notifications or caches the tool list

**Solutions**:
- Confirm your MCP client supports dynamic tool lists before using `PaymentFlow.DYNAMIC_TOOLS`
- Fall back to `PaymentFlow.TWO_STEP` if the client ignores `listChanged` updates
- Restart the client session to clear cached tool metadata after enabling dynamic tools

## Frequently Asked Questions

**Q: How do I deploy PayMCP securely?**
A: Deploy PayMCP on your own infrastructure (AWS, GCP, Heroku, etc.) where:
- You control the server environment
- API keys are stored securely as environment variables
- Users connect via HTTP/WebSocket protocols
- No sensitive credentials are distributed to users

**Q: Can I use multiple payment providers simultaneously?**
A: Yes! PayMCP supports multiple configuration methods. PayMCP currently uses the first configured provider.

**Q: What's the minimum payment amount?**
A: Depends on the provider:
- Stripe: $0.50 USD minimum
- PayPal: $0.01 USD minimum  
- Walleot: No minimum
- Square: $1.00 USD minimum

## Getting Help

### Debug Mode

Enable detailed logging for troubleshooting:

<Tabs>
<TabItem value="python" label="Python">

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# PayMCP will log:
# - Provider API calls and responses
# - Payment flow decisions
# - Error details and stack traces
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// Enable debug logging
process.env.DEBUG = 'paymcp:*';

// PayMCP will log:
// - Provider API calls and responses
// - Payment flow decisions
// - Error details and stack traces
```

</TabItem>
</Tabs>

### Support Channels

1. **GitHub Issues**: [PayMCP Issues](https://github.com/PayMCP/paymcp/issues)
2. **Documentation**: This documentation site
3. **Provider Support**: Use provider specific channels

### Reporting Bugs

When reporting issues, include:
1. **PayMCP version**: `paymcp.__version__`
2. **MCP version**: `mcp.__version__` 
3. **Provider**: Which provider you're using
4. **Payment flow**: TWO_STEP, ELICITATION, etc.
5. **Error messages**: Full error text and stack traces
6. **Code sample**: Minimal reproducible example

## Next Steps

- **[Back to Quickstart](./quickstart)** - If you're just getting started
- **[Provider Guides](./providers/stripe)** - Provider-specific help
- **[Examples](./examples/paid-image-generator)** - Working code examples
- **[API Reference](./api-reference)** - Detailed parameter documentation
