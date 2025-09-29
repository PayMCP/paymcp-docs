---
id: troubleshooting
title: "Troubleshooting & FAQ"
description: Common issues, solutions, and frequently asked questions about PayMCP
---

# Troubleshooting & FAQ

Common issues, solutions, and frequently asked questions about PayMCP.

## 🚨 Critical Security Issue

### STDIO Mode Deployment Error

**Error**: Planning to deploy PayMCP in STDIO mode

**Why this is dangerous**: STDIO mode requires distributing your server (including API keys) to end users, exposing sensitive payment credentials.

**Solution**: Always use hosted deployment:
```python
# ❌ NEVER do this - exposes API keys to users
# Distributing this code gives users your payment secrets
PayMCP(mcp, providers={"stripe": {"apiKey": "sk_live_..."}})

# ✅ Do this - deploy on your secure infrastructure  
# Users connect remotely, never see your API keys
```

## Quick Fixes

### Tool Not Found Error

**Error**: `Tool 'my_tool' not found` or similar MCP errors

**Solution**: Ensure the `ctx: Context` parameter is included:

```python
# ❌ Wrong - missing ctx parameter
@mcp.tool()
@price(amount=0.50, currency="USD")
def my_tool(input: str) -> str:
    return "result"

# ✅ Correct - includes ctx parameter
@mcp.tool()
@price(amount=0.50, currency="USD")
def my_tool(input: str, ctx: Context) -> str:
    return "result"
```

### Provider Authentication Error

**Error**: `Invalid API key` or `Authentication failed`

**Solutions**:
1. **Check API key format**:
   - Stripe: Should start with `sk_test_` or `sk_live_`
   - Walleot: Should start with `wk_test_` or `wk_live_`
   - PayPal: Check client ID and secret format

2. **Verify environment variables**:
```python
import os
print(f"Stripe key: {os.getenv('STRIPE_SECRET_KEY')[:10]}...")  # Check first 10 chars
```

3. **Check provider dashboard**:
   - Ensure API key is active
   - Verify permissions are correct
   - Check account status

### Payment Not Completing

**Error**: User pays but tool doesn't execute

**Solutions**:
1. **Check success URL accessibility**:
```python
# Ensure URLs are accessible
providers = {
    "stripe": {
        "success_url": "https://yourapp.com/success",  # Must be reachable
        "cancel_url": "https://yourapp.com/cancel"
    }
}
```

2. **Verify webhook configuration** (if using webhooks)
3. **Check payment status manually** in provider dashboard

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

### Provider Import Errors (0.2.0+)

**Error**: `ImportError: cannot import name 'StripeProvider' from 'paymcp.providers'`

**Solution**: Ensure you're using PayMCP 0.2.0+ for provider instances:
```python
# Check version first
import paymcp
print(f"PayMCP version: {paymcp.__version__}")  # Should be 0.2.0+

# Then import provider classes
from paymcp.providers import StripeProvider, WalleotProvider
```

### Provider Configuration Type Errors (0.2.0+)

**Error**: `TypeError: Provider must be an instance of BasePaymentProvider`

**Solution**: Ensure custom providers inherit from BasePaymentProvider:
```python
from paymcp.providers import BasePaymentProvider

class MyProvider(BasePaymentProvider):
    def create_payment(self, amount: float, currency: str, description: str):
        return "payment_id", "https://example.com/pay"
    
    def get_payment_status(self, payment_id: str) -> str:
        return "paid"
```

## Provider-Specific Issues

### Stripe Issues

#### Session Expired Error

**Error**: `Invalid session ID` or `Session expired`

**Cause**: Stripe checkout sessions expire after 24 hours

**Solution**: Generate new payment session:
```python
# Don't reuse payment sessions
# Each tool call should create a fresh session
```

#### Webhook Signature Verification Failed

**Error**: `Invalid webhook signature`

**Solution**: Check webhook secret:
```python
import stripe

# Verify webhook secret is correct
webhook_secret = "whsec_..."  # From Stripe dashboard
```

#### Currency Not Supported

**Error**: `Invalid currency code`

**Solution**: Use supported currencies:
```python
# Check Stripe's supported currencies
SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", ...]

@price(amount=1.00, currency="USD")  # Always supported
```

### PayPal Issues

#### OAuth Token Error

**Error**: `Invalid client credentials`

**Solution**: Verify PayPal app configuration:
```python
providers = {
    "paypal": {
        "client_id": "YOUR_CLIENT_ID",      # From PayPal Developer Console
        "client_secret": "YOUR_CLIENT_SECRET",  # From PayPal Developer Console
        "sandbox": True  # Ensure sandbox matches your credentials
    }
}
```

#### Payment Not Capturing

**Error**: Payment authorized but not captured

**Solution**: PayMCP handles auto-capture, but check:
- PayPal app has proper permissions
- Merchant account is verified
- Currency is supported in your region

### Walleot Issues

#### Network Confirmation Delays

**Error**: `Payment pending` for extended periods

**Cause**: Blockchain network congestion

**Solution**: 
- Use PROGRESS flow for better UX during delays
- Consider stablecoins (USDC) for faster confirmation
- Inform users about potential delays

#### Insufficient Gas/Fees

**Error**: `Transaction failed - insufficient gas`

**Cause**: Network fees higher than user's gas allocation

**Solution**: 
- Price in USD (let Walleot handle conversion)
- Recommend users account for network fees
- Use Layer 2 networks when possible

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

**Cause**: User didn't complete payment within 15 minutes

**Solution**:
- Inform users about time limit
- Use shorter timeout for small amounts
- Implement retry mechanism

## Performance Issues

### Slow Payment Creation

**Issue**: Tool calls take long time to return payment URLs

**Solutions**:
1. **Cache provider tokens** when possible
2. **Use async/await** properly
3. **Optimize provider API calls**

```python
# Good: Proper async usage
@mcp.tool()
@price(amount=1.00, currency="USD")
async def fast_tool(input: str, ctx: Context) -> str:
    # PayMCP handles payment creation asynchronously
    return await process_input(input)
```

### High Memory Usage

**Issue**: Memory usage grows over time

**Cause**: Payment session data not cleaned up

**Solution**: Implement cleanup:
```python
# Clean up expired payment sessions periodically
import asyncio

async def cleanup_expired_sessions():
    # Remove sessions older than 24 hours
    pass

# Run cleanup task
asyncio.create_task(cleanup_expired_sessions())
```

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

#### Webhook Testing

**Issue**: Can't receive webhooks locally

**Solution**: Use webhook testing tools:
```bash
# Use ngrok for webhook testing
ngrok http 3000

# Configure webhook URL in provider dashboard:
# https://abc123.ngrok.io/webhook
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

## Configuration Issues (0.2.0+)

### Mixed Configuration Problems

**Error**: `TypeError: build_providers expects a mapping or an iterable of provider instances`

**Solution**: Don't mix configuration styles incorrectly:
```python
# ❌ Wrong - mixing incorrectly
PayMCP(mcp, providers="stripe")  # Invalid type

# ✅ Correct - valid configuration methods
# Config mapping
PayMCP(mcp, providers={"stripe": {"apiKey": "sk_test_..."}})

# Provider instances
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])

# Mixed mapping
PayMCP(mcp, providers={
    "stripe": {"apiKey": "sk_test_..."},  # Config dict
    "walleot": WalleotProvider(api_key="wk_test_...")  # Instance
})
```

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

### General (Updated for 0.2.0)

**Q: Can I use multiple payment providers simultaneously?**
A: Yes! 0.2.0 supports multiple configuration methods. PayMCP currently uses the first configured provider. Provider selection and failover is planned for future releases.

**Q: What's the difference between configuration methods in 0.2.0?**
A: Three methods are available:
- **Config mapping** `{name: {kwargs}}` - Traditional, environment-friendly
- **Provider instances** `{name: Provider(...)}` - Type-safe, IDE-friendly  
- **List of instances** `[Provider(...)]` - Simple, auto-named

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
- Walleot: No minimum (network fees apply)
- Square: $1.00 USD minimum

**Q: Are payments refundable?**
A: Yes, but refund handling depends on your business logic. PayMCP doesn't automatically refund failed tool executions.

### Technical

**Q: Can I customize the payment flow logic?**
A: PayMCP provides standard flows (TWO_STEP, ELICITATION, PROGRESS). Custom flows can be implemented by extending the base provider classes.

**Q: How do I handle partial failures?**
A: Implement proper error handling in your tools:
```python
@price(amount=1.00, currency="USD")
async def robust_tool(input: str, ctx: Context) -> str:
    try:
        result = await expensive_operation(input)
        return result
    except Exception as e:
        # Log error, potentially issue refund
        logger.error(f"Tool failed after payment: {e}")
        raise  # PayMCP will handle the error response
```

**Q: Can I implement subscription billing?**
A: Yes! See the [subscription example](./examples/subscription-tool) for a complete implementation pattern.

### Business

**Q: What are the typical fees?**
A: Provider fees vary:
- Stripe: 2.9% + $0.30 per transaction
- PayPal: 2.9% + fixed fee
- Walleot: ~1% (crypto payments)
- Square: 2.9% + $0.30
- Adyen: Custom enterprise pricing

**Q: How do I handle taxes?**
A: PayMCP handles payment processing only. Tax calculation and compliance are your responsibility. Consider using tax services like TaxJar or Avalara.

**Q: Can I offer free trials?**
A: Yes! Implement free trials in your tool logic:
```python
@mcp.tool()
async def premium_feature(input: str, ctx: Context) -> str:
    user_id = getattr(ctx, 'user_id', 'anonymous')
    
    if is_trial_user(user_id):
        # Provide free access during trial
        return await process_premium(input)
    else:
        # Require payment after trial
        # This tool would need @price decorator
        return await process_premium(input)
```

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
   - Stripe: Dashboard support
   - PayPal: Developer Console
   - Walleot: 24/7 support
   - Others: Provider-specific channels

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


