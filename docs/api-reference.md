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

<Tabs>
<TabItem value="python" label="Python">

```python
class PayMCP:
    def __init__(
        self,
        mcp_instance,
        providers: list = None,
        payment_flow: PaymentFlow = PaymentFlow.TWO_STEP
    )
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
class PayMCP {
    constructor(
        mcpInstance: FastMCP,
        options: {
            providers: Provider[],
            payment_flow?: PaymentFlow
        }
    )
}
```

</TabItem>
</Tabs>

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mcp_instance` | `FastMCP` | Required | Your MCP server instance |
| `providers` | `Union[dict, Iterable]` | `{}` | Payment provider configurations (see Provider Configuration section) |
| `payment_flow` | `PaymentFlow` | `TWO_STEP` | Payment flow strategy |

#### Provider Configuration

Use the canonical provider list format:

```python
providers = [StripeProvider(apiKey="sk_test_...")]
```

Alternative formats are also supported (config mapping, mixed styles) - see the Alternative Configuration section below.

#### Examples

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import StripeProvider

PayMCP(
    mcp,
    providers=[StripeProvider(apiKey="sk_test_...")],
    payment_flow=PaymentFlow.TWO_STEP
)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { PayMCP, PaymentFlow } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

new PayMCP(
    mcp,
    {
        providers: [new StripeProvider({ apiKey: "sk_test_..." })],
        payment_flow: PaymentFlow.TWO_STEP
    }
);
```

</TabItem>
</Tabs>

### PaymentFlow

Enum defining available payment flow strategies.

```python
class PaymentFlow(str, Enum):
    TWO_STEP = "two_step"
    ELICITATION = "elicitation" 
    PROGRESS = "progress"
```

#### Flow Types

| Flow | Description | Best For |
|------|-------------|----------|
| `TWO_STEP` | Split into initiate/confirm steps | Maximum compatibility |
| `ELICITATION` | Interactive payment during execution | Real-time interactions |
| `PROGRESS` | Background payment with progress updates | Real-time interactions  |

## Decorators

### @price

Decorator to add payment requirements to MCP tools.

<Tabs>
<TabItem value="python" label="Python">

```python
def price(amount: float, currency: str = "USD")
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// In registerTool options:
price: { amount: number, currency?: string }
```

</TabItem>
</Tabs>

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `amount` | `float` | Required | Payment amount |
| `currency` | `str` | `"USD"` | ISO 4217 currency code |

#### Example

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
def generate_data_report(input: str, ctx: Context) -> str:
    """Generate a data report from input"""
    return f"Report: {input}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
server.registerTool(
  "generate_data_report",
  {
    description: "Generate a data report from input",
    inputSchema: { input: z.string() },
    price: { amount: 0.50, currency: "USD" },
  },
  async ({ input }, ctx) => {
    return { content: [{ type: "text", text: `Report: ${input}` }] };
  }
);
```

</TabItem>
</Tabs>


## Custom Provider Development

### BasePaymentProvider

All payment providers must inherit from `BasePaymentProvider` and implement the required methods.

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import BasePaymentProvider

class MyProvider(BasePaymentProvider):
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        super().__init__(**kwargs)
    
    def create_payment(self, amount: float, currency: str, description: str) -> tuple[str, str]:
        """Create a payment and return (payment_id, payment_url)"""
        return "payment_id", "https://myprovider.com/pay/payment_id"
    
    def get_payment_status(self, payment_id: str) -> str:
        """Return payment status: 'paid', 'pending', 'failed', or 'cancelled'"""
        return "paid"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { BasePaymentProvider } from 'paymcp/providers';

class MyProvider extends BasePaymentProvider {
    constructor(apiKey: string, options?: any) {
        super(options);
        this.apiKey = apiKey;
    }
    
    createPayment(amount: number, currency: string, description: string): [string, string] {
        // Create a payment and return [payment_id, payment_url]
        return ["payment_id", "https://myprovider.com/pay/payment_id"];
    }
    
    getPaymentStatus(paymentId: string): string {
        // Return payment status: 'paid', 'pending', 'failed', or 'cancelled'
        return "paid";
    }
}
```

</TabItem>
</Tabs>

### Provider Registration

Register custom providers for use with config mappings:

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import register_provider

register_provider("my-gateway", MyProvider)

# Now use with config mapping
PayMCP(mcp, providers={
    "my-gateway": {"api_key": "...", "custom_option": "value"}
})
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { registerProvider } from 'paymcp/providers';

registerProvider("my-gateway", MyProvider);

// Now use with config mapping
new PayMCP(mcp, {
    providers: {
        "my-gateway": { api_key: "...", custom_option: "value" }
    }
});
```

</TabItem>
</Tabs>

### Class Path Configuration

Use fully-qualified class paths in config:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers={
    "custom": {
        "class": "my_package.providers:MyProvider",
        "api_key": "...",
        "custom_config": "value"
    }
})
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
new PayMCP(mcp, {
    providers: {
        "custom": {
            class: "my_package.providers:MyProvider",
            api_key: "...",
            custom_config: "value"
        }
    }
});
```

</TabItem>
</Tabs>

## Provider Configuration

### Stripe

```python
providers = [StripeProvider(apiKey="sk_test_...")]
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | `str` | Yes | Stripe secret key (sk_test_... or sk_live_...) |

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
providers = [PayPalProvider(client_id="...", client_secret="...", sandbox=True)]
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `client_id` | `str` | Yes | - | PayPal application client ID |
| `client_secret` | `str` | Yes | - | PayPal application client secret |
| `sandbox` | `bool` | No | `True` | Use PayPal sandbox environment |

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
providers = [CoinbaseProvider(api_key="...")]
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `api_key` | `str` | Yes | - | Coinbase Commerce API key |

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

**Latest Features:**
- Extensible provider system with multiple configuration styles
- Custom provider support via `BasePaymentProvider`
- Provider registration with `register_provider()`

## Next Steps

- **[Quickstart Guide](./quickstart)** - Get started with PayMCP
- **[Provider Setup](./providers/stripe)** - Configure your payment provider
- **[Examples](./examples/paid-image-generator)** - See real-world implementations
- **[Troubleshooting](./troubleshooting)** - Common issues and solutions
