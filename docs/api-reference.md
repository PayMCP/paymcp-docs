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
        payment_flow: PaymentFlow = PaymentFlow.TWO_STEP,
        state_store = None
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
            paymentFlow?: PaymentFlow,
            stateStore?: StateStore;
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
| `state_store` | `StateStore` | `InMemoryStateStore` | State Store for TWO_STEP flow |

#### Provider Configuration

Use the canonical provider list format:

<Tabs>
<TabItem value="python" label="Python">

```python
providers = [StripeProvider(apiKey="sk_test_...")]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = [StripeProvider({ apiKey: "sk_test_..." })];
```

</TabItem>
</Tabs>

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
import { installPayMCP, PaymentFlow } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

installPayMCP(mcp, {
    providers: [StripeProvider({ apiKey: "sk_test_..." })],
    paymentFlow: PaymentFlow.TWO_STEP
});
```

</TabItem>
</Tabs>

## PaymentFlow

Enum defining available payment flow strategies.

<Tabs>
<TabItem value="python" label="Python">

```python
class PaymentFlow(str, Enum):
    TWO_STEP = "two_step"
    ELICITATION = "elicitation" 
    PROGRESS = "progress"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
enum PaymentFlow {
    TWO_STEP = "two_step",
    ELICITATION = "elicitation",
    PROGRESS = "progress"
}
```

</TabItem>
</Tabs>

#### Flow Types

| Flow | Description | Best For |
|------|-------------|----------|
| `TWO_STEP` | Split into initiate/confirm steps | Maximum compatibility |
| `ELICITATION` | Payment link during execution | Real-time interactions |
| `PROGRESS` | Experimental auto-checking of payment status | Real-time interactions  |

For more details about payment flow concepts, see [Concepts and Flows](./concepts-and-flows).


## StateStore

By default, when using the `TWO_STEP` payment flow, PayMCP stores pending tool arguments in memory using a process-local `Map`. This is not durable and will not work across server restarts or multiple server instances (no horizontal scaling).

To enable durable and scalable state storage, you can provide a custom StateStore implementation. PayMCP includes a built-in RedisStateStore, which works with any Redis-compatible client.

Example: Using Redis for State Storage

<Tabs>
<TabItem value="python" label="Python">

```python
from redis.asyncio import from_url
from paymcp import PayMCP, RedisStateStore

redis = await from_url("redis://localhost:6379")
PayMCP(
    mcp,
    providers={"stripe": {"apiKey": "..."}},
    state_store=RedisStateStore(redis)
)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { createClient } from "redis";
import { installPayMCP, RedisStateStore, PaymentFlow } from "paymcp";

const redisClient = createClient({ url: "redis://localhost:6379" });
await redisClient.connect();

installPayMCP(server, {
  providers: { /* ... */ },
  paymentFlow: PaymentFlow.TWO_STEP,
  stateStore: new RedisStateStore(redisClient),
});
```

</TabItem>
</Tabs>

## Payment Providers

PayMCP provides an extensible provider system that abstracts payment providers behind a common interface. Providers can be supplied in multiple ways to give you maximum flexibility:

### Configuration Methods

#### Recommended Provider Development

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

installPayMCP(mcp, { providers: [StripeProvider({ apiKey: "sk_test_..." })] });
```

</TabItem>
</Tabs>

#### Alternative Configuration

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers={
    "stripe": {"apiKey": "..."}
})
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { installPayMCP } from 'paymcp';

installPayMCP(mcp, {
    providers: {
        "stripe": { apiKey: "...", }
    }
});
```

</TabItem>
</Tabs>


<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers={
    "stripe": StripeProvider(apiKey="sk_test_...")
})
```

</TabItem>
<TabItem value="typescript" label="TypeScript">
```typescript
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

installPayMCP(mcp, {
    providers: {
        "stripe": StripeProvider({ apiKey: "sk_test_..." })
    }
});
```

</TabItem>
</Tabs>

This flexibility allows you to:
- Mix different configuration styles in the same setup
- Use custom providers alongside built-in ones
- Dynamically configure providers at runtime
- Share provider instances across multiple PayMCP setups

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
mcp.tool(
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

## Provider Configuration

### Stripe

<Tabs>
<TabItem value="python" label="Python">

```python
providers = [StripeProvider(apiKey="sk_test_...")]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = [StripeProvider({ apiKey: "sk_test_..." })];
```

</TabItem>
</Tabs>

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | `str` | Yes | Stripe secret key (sk_test_... or sk_live_...) |

### Walleot

<Tabs>
<TabItem value="python" label="Python">

```python
providers = {
    "walleot": {
        "apiKey": str,              # Required: Walleot API key
    }
}
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = {
    "walleot": {
        apiKey: string              // Required: Walleot API key
    }
};
```

</TabItem>
</Tabs>

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | `str` | Yes | Walleot API key (sk_test_... or sk_live_...) |

### PayPal

<Tabs>
<TabItem value="python" label="Python">

```python
providers = [PayPalProvider(client_id="...", client_secret="...", sandbox=True)]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = [PayPalProvider({ client_id: "...", client_secret: "...", sandbox: true })];
```

</TabItem>
</Tabs>

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `client_id` | `str` | Yes | - | PayPal application client ID |
| `client_secret` | `str` | Yes | - | PayPal application client secret |
| `sandbox` | `bool` | No | `True` | Use PayPal sandbox environment |

### Square

<Tabs>
<TabItem value="python" label="Python">

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

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = {
    "square": {
        access_token: string,        // Required: Square access token
        location_id: string,         // Required: Square location ID
        sandbox: boolean,            // Optional: Use sandbox environment
        redirect_url: string,        // Optional: Redirect URL
        api_version: string          // Optional: API version
    }
};
```

</TabItem>
</Tabs>

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `access_token` | `str` | Yes | - | Square access token |
| `location_id` | `str` | Yes | - | Square location identifier |
| `sandbox` | `bool` | No | `True` | Use Square sandbox environment |
| `redirect_url` | `str` | No | - | Post-payment redirect URL |
| `api_version` | `str` | No | `"2025-03-19"` | Square API version |

### Adyen

<Tabs>
<TabItem value="python" label="Python">

```python
providers = {
    "adyen": {
        "api_key": str,             # Required: Adyen API key
        "merchant_account": str,    # Required: Merchant account name
        "sandbox": bool,            # Optional: Use test environment
    }
}
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = {
    "adyen": {
        api_key: string,             // Required: Adyen API key
        merchant_account: string,   // Required: Merchant account name
        sandbox: boolean             // Optional: Use test environment
    }
};
```

</TabItem>
</Tabs>

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `api_key` | `str` | Yes | - | Adyen API key |
| `merchant_account` | `str` | Yes | - | Adyen merchant account identifier |
| `sandbox` | `bool` | No | `True` | Use Adyen test environment |

### Coinbase Commerce

<Tabs>
<TabItem value="python" label="Python">

```python
providers = [CoinbaseProvider(api_key="...")]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = [CoinbaseProvider({ api_key: "..." })];
```

</TabItem>
</Tabs>

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `api_key` | `str` | Yes | - | Coinbase Commerce API key |




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


## Version Information

Current PayMCP version: Check with `paymcp.__version__`

```python
import paymcp
print(f"PayMCP version: {paymcp.__version__}")
```


## Next Steps

- **[Quickstart Guide](./quickstart)** - Get started with PayMCP
- **[Provider Setup](./providers/stripe)** - Configure your payment provider
- **[Examples](./examples/paid-image-generator)** - See real-world implementations
- **[Troubleshooting](./troubleshooting)** - Common issues and solutions
