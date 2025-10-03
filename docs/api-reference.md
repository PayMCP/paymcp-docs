---
id: api-reference
title: "API Reference"
description: Complete API reference for PayMCP classes, functions, and configuration options
---

# API Reference

Complete reference documentation for PayMCP classes, functions, and configuration options.

## Core Classes

### PayMCP

The main PayMCP class that integrates payment functionality into your MCP server.

```python
class PayMCP:
    def __init__(
        self,
        mcp_instance,
        providers: Union[dict, Iterable] = None,
        payment_flow: PaymentFlow = PaymentFlow.TWO_STEP
    )
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mcp_instance` | `FastMCP` | Required | Your MCP server instance |
| `providers` | `Union[dict, Iterable]` | `{}` | Payment provider configurations (see Provider Configuration section) |
| `payment_flow` | `PaymentFlow` | `TWO_STEP` | Payment flow strategy |

#### Provider Configuration (New in 0.2.0)

PayMCP now supports multiple ways to configure providers:

**1. Config Mapping (existing behavior):**
```python
providers = {
    "stripe": {"apiKey": "sk_test_..."},
    "walleot": {"apiKey": "wk_test_..."}
}
```

**2. Ready-made instances:**
```python
from paymcp.providers import StripeProvider, WalleotProvider

providers = {
    "stripe": StripeProvider(apiKey="sk_test_..."),
    "custom": MyCustomProvider(api_key="...")
}
```

**3. List of instances:**
```python
providers = [
    StripeProvider(apiKey="sk_test_..."),
    WalleotProvider(api_key="wk_test_..."),
    MyProvider(...)
]
```

#### Examples

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import StripeProvider

# Config mapping (traditional)
paymcp = PayMCP(
    mcp_instance=mcp,
    providers={
        "stripe": {"apiKey": "sk_test_..."},
        "walleot": {"apiKey": "wk_test_..."}
    },
    payment_flow=PaymentFlow.ELICITATION
)

# Provider instances
paymcp = PayMCP(
    mcp_instance=mcp,
    providers=[
        StripeProvider(apiKey="sk_test_..."),
        WalleotProvider(api_key="wk_test_...")
    ],
    payment_flow=PaymentFlow.TWO_STEP
)
```

### PaymentFlow

Enum defining available payment flow strategies.

```python
class PaymentFlow(str, Enum):
    TWO_STEP = "two_step"
    ELICITATION = "elicitation" 
    PROGRESS = "progress"
    OOB = "oob"
```

#### Flow Types

| Flow | Description | Best For |
|------|-------------|----------|
| `TWO_STEP` | Split into initiate/confirm steps | Maximum compatibility |
| `ELICITATION` | Interactive payment during execution | Real-time interactions |
| `PROGRESS` | Background payment with progress updates | Real-time interactions  |
| `OOB` | Out-of-band  | Coming soon |

## Decorators

### @price

Decorator to add payment requirements to MCP tools.

```python
def price(amount: float, currency: str = "USD")
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `amount` | `float` | Required | Payment amount |
| `currency` | `str` | `"USD"` | ISO 4217 currency code |

#### Example

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
def generate_report(input: str, ctx: Context) -> str:
    """Tool description"""
    # Your code goes here
    return f"Processed: {input}"
```

#### Supported Currencies

Currency support depends on your payment provider. Some providers (like Stripe) allow you to set prices in one currency but accept payments in many others, handling conversion automatically. Please check your provider’s documentation for the full list of supported currencies and conversion rules.

## Custom Provider Development

### BasePaymentProvider

All payment providers must inherit from `BasePaymentProvider` and implement the required methods.

```python
from paymcp.providers import BasePaymentProvider

class MyProvider(BasePaymentProvider):
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        super().__init__(**kwargs)
    
    def create_payment(self, amount: float, currency: str, description: str) -> tuple[str, str]:
        """Create a payment and return (payment_id, payment_url)"""
        # Implementation specific to your provider
        return "payment_id", "https://myprovider.com/pay/payment_id"
    
    def get_payment_status(self, payment_id: str) -> str:
        """Return payment status: 'paid', 'pending', 'failed', or 'cancelled'"""
        # Implementation specific to your provider
        return "paid"
```

### Provider Registration

Register custom providers for use with config mappings:

```python
from paymcp.providers import register_provider

register_provider("my-gateway", MyProvider)

# Now use with config mapping
PayMCP(mcp, providers={
    "my-gateway": {"api_key": "...", "custom_option": "value"}
})
```

### Class Path Configuration

Use fully-qualified class paths in config:

```python
PayMCP(mcp, providers={
    "custom": {
        "class": "my_package.providers:MyProvider",
        "api_key": "...",
        "custom_config": "value"
    }
})
```

## Provider Configuration

### Stripe

```python
providers = {
    "stripe": {
        "apiKey": str,              # Required: Stripe secret key
        "success_url": str,         # Optional: Success redirect URL
        "cancel_url": str,          # Optional: Cancel redirect URL
    }
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | `str` | Yes | Stripe secret key (sk_test_... or sk_live_...) |
| `success_url` | `str` | No | URL to redirect after successful payment |
| `cancel_url` | `str` | No | URL to redirect after cancelled payment |

### Walleot

```python
providers = {
    "walleot": {
        "apiKey": str,              # Required: Walleot API key
    }
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | `str` | Yes | Walleot API key (wk_test_... or wk_live_...) |

### PayPal

```python
providers = {
    "paypal": {
        "client_id": str,           # Required: PayPal client ID
        "client_secret": str,       # Required: PayPal client secret
        "sandbox": bool,            # Optional: Use sandbox environment
        "success_url": str,         # Optional: Success redirect URL
        "cancel_url": str,          # Optional: Cancel redirect URL
    }
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `client_id` | `str` | Yes | - | PayPal application client ID |
| `client_secret` | `str` | Yes | - | PayPal application client secret |
| `sandbox` | `bool` | No | `True` | Use PayPal sandbox environment |
| `success_url` | `str` | No | - | Success redirect URL |
| `cancel_url` | `str` | No | - | Cancel redirect URL |

### Square

```python
providers = {
    "square": {
        "access_token": str,        # Required: Square access token
        "location_id": str,         # Required: Square location ID
        "sandbox": bool,            # Optional: Use sandbox environment
        "redirect_url": str,        # Optional: Redirect URL
        "api_version": str,         # Optional: API version
    }
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `access_token` | `str` | Yes | - | Square access token |
| `location_id` | `str` | Yes | - | Square location identifier |
| `sandbox` | `bool` | No | `True` | Use Square sandbox environment |
| `redirect_url` | `str` | No | - | Post-payment redirect URL |
| `api_version` | `str` | No | `"2025-03-19"` | Square API version |

### Adyen

```python
providers = {
    "adyen": {
        "api_key": str,             # Required: Adyen API key
        "merchant_account": str,    # Required: Merchant account name
        "return_url": str,          # Required: Return URL
        "sandbox": bool,            # Optional: Use test environment
    }
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `api_key` | `str` | Yes | - | Adyen API key |
| `merchant_account` | `str` | Yes | - | Adyen merchant account identifier |
| `return_url` | `str` | Yes | - | URL to return after payment |
| `sandbox` | `bool` | No | `True` | Use Adyen test environment |

### Coinbase Commerce

```python
providers = {
    "coinbase": {
        "api_key": str,             # Required: Coinbase Commerce API key
        "success_url": str,         # Optional: Success redirect URL
        "cancel_url": str,          # Optional: Cancel redirect URL
        "confirm_on_pending": bool, # Optional: Accept pending payments
    }
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `api_key` | `str` | Yes | - | Coinbase Commerce API key |
| `success_url` | `str` | No | - | Success redirect URL |
| `cancel_url` | `str` | No | - | Cancel redirect URL |
| `confirm_on_pending` | `bool` | No | `False` | Accept payments on pending status |

## Payment Flow Details

### TWO_STEP Flow

The TWO_STEP flow splits your tool into two separate tools:

1. **Initiate**: To create and return payment information
2. **Confirm**: Separate confirmation tool executes the original function after payment succeed

#### Response Format (Initiate)

```python
{
    "message": str,              # Payment instructions for user
    "payment_url": str,          # URL for user to complete payment
    "payment_id": str,           # Unique payment identifier
    "next_step": str,            # Name of confirmation tool
}
```

#### Confirmation Tool

PayMCP automatically creates a confirmation tool with the pattern:
```
confirm_{original_tool_name}_payment
```

Example:
- Original tool: `generate_image`
- Confirmation tool: `confirm_generate_image_payment`

### ELICITATION Flow

The ELICITATION flow handles payment interactively during tool execution.

#### Requirements

- MCP client must support elicitation interactions
- User must be available to complete payment during execution

#### Response Format

Returns the original tool's response after successful payment.

### PROGRESS Flow

The PROGRESS flow shows payment status and progress updates.

#### Features

- Real-time progress reporting via `ctx.report_progress()`
- Automatic execution after payment confirmation

#### Progress Messages

```python
await ctx.report_progress(
    message="Waiting for payment confirmation...",
    progress=25,
    total=100
)
```

### OOB Flow

The OOB (Out-of-Band) flow is planned for future releases.


## Context Requirements

All priced tools must include a `ctx: Context` parameter:

```python
from mcp.server.fastmcp import Context

@mcp.tool()
@price(amount=1.00, currency="USD")
def my_tool(input: str, ctx: Context) -> str:
    # ctx parameter is required for PayMCP integration
    return process_input(input)
```

### Why Context is Required

The `Context` parameter provides:
- User identification for payment tracking
- Progress reporting capabilities (PROGRESS flow)
- Elicitation support (ELICITATION flow)
- Tool execution metadata

## Error Handling

PayMCP handles various error scenarios automatically:

### Payment Errors

| Error Type | Description | User Action |
|------------|-------------|-------------|
| Payment declined | Card/payment method rejected | Try different payment method |
| Insufficient funds | Not enough balance | Add funds or use different method |
| Payment timeout | User didn't complete payment | Retry the tool call |
| Invalid currency | Currency not supported | Use supported currency |

### Configuration Errors

| Error Type | Description | Solution |
|------------|-------------|----------|
| Invalid API key | Wrong or expired key | Check provider dashboard |
| Missing provider | Provider not configured | Add provider to configuration |
| Invalid flow | Unsupported payment flow | Use supported flow type |

### Tool Errors

| Error Type | Description | Solution |
|------------|-------------|----------|
| Missing context | No `ctx` parameter | Add `ctx: Context` parameter |
| Invalid amount | Amount less than or equal to 0 or not numeric | Use valid positive amount |

## Advanced Configuration

### Multiple Providers

```python
# PayMCP uses the first provider by default
# User will be able to choose how he wants to pay (coming soon)
PayMCP(
    mcp,
    providers={
        "stripe": {"apiKey": "sk_..."},     
        "walleot": {"apiKey": "wk_..."},     
        "paypal": {                      
            "client_id": "...",
            "client_secret": "..."
        }
    }
)
```

### Environment Variables

Use environment variables for secure credential storage:

```python
import os

PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": os.getenv("STRIPE_SECRET_KEY"),
            "success_url": os.getenv("STRIPE_SUCCESS_URL"),
            "cancel_url": os.getenv("STRIPE_CANCEL_URL")
        }
    }
)
```

### Development vs Production

```python
# Development
PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": os.getenv("STRIPE_TEST_KEY"),  # sk_test_...
            "success_url": "http://localhost:3000/success"
        }
    }
)

# Production
PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": os.getenv("STRIPE_LIVE_KEY"),  # sk_live_...
            "success_url": "https://yourapp.com/success"
        }
    }
)
```

## Version Information

Current PayMCP version: Check with `paymcp.__version__`

```python
import paymcp
print(f"PayMCP version: {paymcp.__version__}")
```

### Changelog

#### 0.2.0 (Latest)

**Added:**
- **Extensible provider system**: Providers can now be supplied in multiple ways:
  - As config mapping `{name: {kwargs}}` (existing behavior)
  - As ready-made instances: `{"stripe": StripeProvider(...), "custom": MyProvider(...)}`
  - As a list of instances: `[WalleotProvider(...), MyProvider(...)]`
- Support for custom provider classes via `register_provider()` function
- Class path configuration for providers using `"class"` key in config
- Mixed configuration styles support (combine different methods in same setup)

## Next Steps

- **[Quickstart Guide](./quickstart)** - Get started with PayMCP
- **[Provider Setup](./providers/stripe)** - Configure your payment provider
- **[Examples](./examples/paid-image-generator)** - See real-world implementations
- **[Troubleshooting](./troubleshooting)** - Common issues and solutions
