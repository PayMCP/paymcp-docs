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
        mode: Mode = Mode.AUTO,
        state_store = None
    )
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
class PayMCP {
    constructor(
        mcpInstance,
        options: {
            providers: Provider[],
            mode?: Mode,
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
| `mcp_instance` | `MCP server instance` | Required | Your MCP server instance |
| `providers` | `Union[dict, Iterable]` | Required | Payment provider configurations (see Provider Configuration section) |
| `mode` | `Mode` | `AUTO` | Coordination mode strategy |
| `state_store` | `StateStore` | `InMemoryStateStore` | State Store |

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
providers = [new StripeProvider({ apiKey: "sk_test_..." })];
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
from paymcp import PayMCP, Mode
from paymcp.providers import StripeProvider

PayMCP(
    mcp,
    providers=[StripeProvider(apiKey="sk_test_...")],
    mode=Mode.AUTO
)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { installPayMCP, Mode } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

installPayMCP(mcp, {
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    mode: Mode.AUTO
});
```

</TabItem>
</Tabs>

## Mode

Enum defining available payment modes.

<Tabs>
<TabItem value="python" label="Python">

```python
class Mode(str, Enum):
    AUTO = "auto"
    TWO_STEP = "two_step"
    RESUBMIT = "resubmit"
    X402 = "X402"
    ELICITATION = "elicitation" 
    PROGRESS = "progress"
    DYNAMIC_TOOLS = "dynamic_tools"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
enum Mode {
    AUTO = "auto",
    TWO_STEP = "two_step",
    RESUBMIT = "resubmit",
    X402 = "X402",
    ELICITATION = "elicitation",
    PROGRESS = "progress",
    DYNAMIC_TOOLS = "dynamic_tools"
}
```

</TabItem>
</Tabs>

#### Coordination Modes

| Mode | Description | Best For |
|------|-------------|----------|
| `AUTO` | Detects client capabilities; prefers `X402` when configured and supported, otherwise uses `ELICITATION` and falls back to `RESUBMIT` | Default, best balance of UX and compatibility |
| `RESUBMIT` | First call returns Payment Required Error with `payment_url` + `payment_id`; second call retries with the ID | Tool retries where the client handles user payment completion |
| `ELICITATION` | Payment link during execution | Real-time interactions |
| `TWO_STEP` | Split into initiate/confirm steps | Maximum compatibility with older clients |
| `X402` | Returns an x402 payment request; client replies with a payment signature | On-chain x402 payments with compatible clients |
| `PROGRESS` | Experimental auto-checking of payment status | Real-time interactions |
| `DYNAMIC_TOOLS` | Dynamically expose the next valid tool action | Clients with `listChanged` support |

For more details about coordination mode concepts, see [Coordination Modes](./concepts-and-flows).


## StateStore

By default, PayMCP stores pending tool arguments in memory using a process-local `Map`. This is not durable and will not work across server restarts or multiple server instances (no horizontal scaling).

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
import { installPayMCP, RedisStateStore, Mode } from "paymcp";

const redisClient = createClient({ url: "redis://localhost:6379" });
await redisClient.connect();

installPayMCP(server, {
  providers: { /* ... */ },
  mode: Mode.TWO_STEP,
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

installPayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });
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
        "stripe": new StripeProvider({ apiKey: "sk_test_..." })
    }
});
```

</TabItem>
</Tabs>

## Custom Providers

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

    # Optional: subscriptions
    async def get_subscriptions(self, user_id: str, email: str | None = None) -> dict:
        return {
            "current_subscriptions": [],  # list of current user subscriptions
            "available_subscriptions": [],  # list of available plans
        }

    # Optional: subscriptions
    async def start_subscription(self, plan_id: str, user_id: str, email: str | None = None) -> dict:
        return {
            "message": "Subscription created",
            "sessionId": "SESSION_ID",
            "checkoutUrl": "https://example.com/checkout",
        }

    # Optional: subscriptions
    async def cancel_subscription(self, subscription_id: str, user_id: str, email: str | None = None) -> dict:
        return {
            "message": "Subscription cancellation scheduled",
            "canceled": True,
            "endDate": "2025-12-31T00:00:00Z",
        }
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

    // Optional: subscriptions
    async getSubscriptions(userId: string, email?: string) {
        return {
            current_subscriptions: [], // list of current user subscriptions
            available_subscriptions: [], // list of available plans
        };
    }

    // Optional: subscriptions
    async startSubscription(planId: string, userId: string, email?: string) {
        return {
            message: "Subscription created",
            sessionId: "SESSION_ID",
            checkoutUrl: "https://example.com/checkout",
        };
    }

    // Optional: subscriptions
    async cancelSubscription(subscriptionId: string, userId: string, email?: string) {
        return {
            message: "Subscription cancellation scheduled",
            canceled: true,
            endDate: "2025-12-31T00:00:00Z",
        };
    }
}
```

</TabItem>
</Tabs>

## Price & Subscription Configuration

PayMCP supports two common gating mechanisms: **pay-per-request** pricing via `price`, and **access control** via `subscription` (require an active plan to use the tool). Python users can use decorators; in other languages you can set the same values via tool metadata.


### Price

Define **pay-per-request** pricing for a tool. 

#### Parameters

| TS | PY | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `amount` | `price` | `float` | Required | Payment amount |
| `currency` | `currency` | `str` | `"USD"` | ISO 4217 currency code |

#### Example

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(price=0.50, currency="USD")
def generate_data_report(input: str, ctx: Context) -> str:
    """Generate a data report from input"""
    return f"Report: {input}"

#Alternatively, you can pass pricing via tool metadata
@mcp.tool(meta={"price":{"price":0.50, "currency"="USD"}})
def generate_data_report(input: str, ctx: Context) -> str:
    """Generate a data report from input"""
    return f"Report: {input}"

```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
mcp.registerTool(
  "generate_data_report",
  {
    description: "Generate a data report from input",
    inputSchema: { input: z.string() },
    _meta: { price: { amount: 0.50, currency: "USD" } },
  },
  async ({ input }, extra) => {
    return { content: [{ type: "text", text: `Report: ${input}` }] };
  }
);
```

</TabItem>
</Tabs>

### @subscription

Require an **active subscription plan** to use a tool (access control). 


#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `plan` | `str \| list[str]` | Required | Accepted plan IDs from your provider |

#### Example

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp import subscription

@mcp.tool()
@subscription(plan="price_pro_monthly")  # or a list of accepted plan IDs
async def generate_report(ctx: Context) -> str:
    return "Your report"

#Alternatively, you can pass subscription info via tool metadata
@mcp.tool(meta={"subscription":{"plan":"price_pro_monthly"}})
def generate_data_report(input: str, ctx: Context) -> str:
    """Generate a data report from input"""
    return f"Report: {input}"


```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
server.registerTool(
  "generate_report",
  {
    title: "Generate report",
    description: "Requires an active Pro subscription.",
    _meta: { subscription: { plan: "price_pro_monthly" } }, // or an array of accepted plan ids
  },
  async (extra) => {
    return { content: [{ type: "text", text: "Your report" }] };
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
providers = [StripeProvider(api_key="sk_test_...")]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = [new StripeProvider({ apiKey: "sk_test_..." })];
```

</TabItem>
</Tabs>

#### Parameters

| TS | PY | Type | Required | Description |
|---|---|---|---|---|
| `apiKey` | `api_key` | `string` / `str` | Yes | Stripe secret key (`sk_test_...` or `sk_live_...`).  |
| `successUrl` | `success_url` | `string` / `str` | No | Redirect URL after a successful Stripe Checkout. Supports `{CHECKOUT_SESSION_ID}` placeholder.  |
| `cancelUrl` | `cancel_url` | `string` / `str` | No | Redirect URL if the user cancels payment in Stripe Checkout. |
| `logger` | `logger` | `Logger`  | No | Optional logger instance to use for provider logs. |

### Walleot

<Tabs>
<TabItem value="python" label="Python">

```python
providers = {
    "walleot": {
        "api_key": str,              # Required: Walleot API key
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

| TS | PY | Type | Required | Description |
|---|---|---|---|---|
| `apiKey` | `api_key` | `string` / `str` | Yes | Walleot API key. |
| `logger` | `logger` | `Logger`  | No | Optional logger instance to use for provider logs. |

### PayPal

<Tabs>
<TabItem value="python" label="Python">

```python
providers = [PayPalProvider(client_id="...", client_secret="...", sandbox=True)]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = [new PayPalProvider({ clientId: "...", clientSecret: "...", sandbox: true })];
```

</TabItem>
</Tabs>

#### Parameters

| TS | PY | Type | Required | Description |
|---|---|---|---|---|
| `clientId` | `client_id` | `string` / `str` | Yes | PayPal application client ID. |
| `clientSecret` | `client_secret` | `string` / `str` | Yes | PayPal application client secret. |
| `sandbox` | `sandbox` | `boolean` / `bool` | No | If `true`, uses PayPal sandbox API (`api-m.sandbox.paypal.com`); otherwise uses production (`api-m.paypal.com`). Default: `true`. |
| `successUrl` | `success_url` | `string` / `str` | No | URL the user is redirected to after successful approval/checkout. |
| `cancelUrl` | `cancel_url` | `string` / `str` | No | URL the user is redirected to if they cancel payment. |
| `logger` | `logger` | `Logger` | No | Optional logger instance to use for provider logs. |

### Square

<Tabs>
<TabItem value="python" label="Python">

```python
providers = {
    "square": {
        "access_token": str,        # Required: Square access token
        "location_id": str,         # Required: Square location ID
    }
}
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = {
    "square": {
        accessToken: string,        // Required: Square access token
        locationId: string,         // Required: Square location ID
    }
};
```

</TabItem>
</Tabs>

#### Parameters

| TS | PY | Type | Required | Description |
|---|---|---|---|---|
| `accessToken` | `access_token` | `string` / `str` | Yes | Square access token. |
| `locationId` | `location_id` | `string` / `str` | Yes | Square location identifier. |
| `sandbox` | `sandbox` | `boolean` / `bool` | No | If `true`, uses Square sandbox base URL; otherwise uses production base URL. Default: `true`. |
| `redirectUrl` | `redirect_url` | `string` / `str` | No | URL Square redirects to after payment/checkout completion. |
| `apiVersion` | `api_version` | `string` / `str` | No | Square API version. If not provided, Python uses `SQUARE_API_VERSION` env var, then defaults to `2025-03-19`. |
| `logger` | `logger` | `Logger` | No | Optional logger instance to use for provider logs. |

### Adyen

<Tabs>
<TabItem value="python" label="Python">

```python
providers = {
    "adyen": {
        "api_key": str,             # Required: Adyen API key
        "merchant_account": str,    # Required: Merchant account name
    }
}
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = {
    "adyen": {
        apiKey: string,             // Required: Adyen API key
        merchantAccount: string,    // Required: Merchant account name
    }
};
```

</TabItem>
</Tabs>

#### Parameters

| TS | PY | Type | Required | Description |
|---|---|---|---|---|
| `apiKey` | `api_key` | `string` / `str` | Yes | Adyen API key.  |
| `merchantAccount` | `merchant_account` | `string` / `str` | Yes | Adyen merchant account identifier.  |
| `successUrl` | `return_url` | `string` / `str` | No | Return URL / redirect URL used by Adyen to return the user to your app with payment result info. |
| `sandbox` | `sandbox` | `boolean` / `bool` | No | If `true`, uses Adyen test environment; otherwise uses live environment. Default: `false`. |
| `logger` | `logger` | `Logger`  | No | Optional logger instance to use for provider logs. |



### Coinbase Commerce

<Tabs>
<TabItem value="python" label="Python">

```python
providers = [CoinbaseProvider(api_key="...")]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
providers = [new CoinbaseProvider({ apiKey: "..." })];
```

</TabItem>
</Tabs>

#### Parameters

| TS | PY | Type | Required | Description |
|---|---|---|---|---|
| `apiKey` | `api_key` | `string` / `str` | Yes | Coinbase Commerce API key.  |
| `successUrl` | `success_url` | `string` / `str` | No | URL the user is redirected to after successful payment completion.  |
| `cancelUrl` | `cancel_url` | `string` / `str` | No | URL the user is redirected to if they cancel payment.  |
| `confirmOnPending` | `confirm_on_pending` | `boolean` / `bool` | No | If `true`, treat `PENDING` status as paid for faster confirmation. **Risk:** rare cases may still fail or be cancelled after `PENDING`. Default: `false`. |
| `logger` | `logger` | `Logger`  | No | Optional logger instance to use for provider logs. |


### X402

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import X402Provider

providers = [
    X402Provider(
        pay_to=[
            {"address": "0xYourAddress", "network": "eip155:8453", "asset": "USDC"}
        ],
    )
]
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { X402Provider } from 'paymcp/providers';

const providers = [
  new X402Provider({
    payTo: [
      { address: "0xYourAddress", network: "eip155:8453", asset: "USDC" }
    ],
  })
];
```

</TabItem>
</Tabs>

#### Parameters

| TS | PY | Type | Required | Description |
|---|---|---|---|---|
| `payTo` | `pay_to` | `PayTo[]` / `list[dict]` | Yes | Recipient list (see **PayTo item** below). |
| `facilitator` | `facilitator` | `object` / `dict` | No | Facilitator settings (see **Facilitator** below). |
| `resourceInfo` | `resource_info` | `object` / `dict` | No | Optional resource metadata shown to the client (see **ResourceInfo** below). |
| `x402Version` | `x402_version` | `number` / `int` | No | X402 protocol version (default: `2`). |
| `gasLimit` | `gas_limit` | `string` / `str` | No | Default gas limit applied to all `payTo` items (can be overridden per-item). |
| `logger` | `logger` | `Logger` | No | Optional logger instance to use for provider logs. |

##### PayTo item

Each item in `payTo` / `pay_to` supports:

| TS key | PY key | Type | Required | Default | Description |
|---|---|---|---|---|---|
| `address` | `address` | `string` / `str` | Yes | — | Recipient wallet address. |
| `network` | `network` | `string` / `str` | No | `eip155:8453` | Network identifier (e.g. `eip155:8453`, `eip155:84532`, `solana-devnet`, `solana-mainnet`). |
| `asset` | `asset` | `string` / `str` | No | `USDC` | Asset symbol/address. For Base networks, `USDC` is auto-mapped to the canonical contract address. |
| `multiplier` | `multiplier` | `number` / `int` | No | `1_000_000` | Token base-unit multiplier (USDC = 6 decimals). |
| `domainName` | `domainName` | `string` / `str` | No | `USD Coin` | EIP-712 domain name. Note: Base Sepolia USDC uses `USDC`. |
| `domainVersion` | `domainVersion` | `string` / `str` | No | `2` | EIP-712 domain version (Circle USDC uses `2`). |
| `gasLimit` | `gasLimit` | `string` / `str` | No | — | Optional per-recipient gas limit override. |

##### Facilitator

`facilitator` controls how PayMCP talks to the x402 facilitator. The default is `https://facilitator.paymcp.info` and requires no API keys. Coinbase CDP requires `apiKeyId` + `apiKeySecret` or a custom `createAuthHeaders` callback.

| TS key | PY key | Type | Required | Description |
|---|---|---|---|---|
| `url` | `url` | `string` / `str` | No | Facilitator base URL (default: `https://facilitator.paymcp.info`). |
| `apiKeyId` | `apiKeyId` | `string` / `str` | No | Coinbase CDP API key id (used to sign requests). |
| `apiKeySecret` | `apiKeySecret` | `string` / `str` | No | Coinbase CDP API key secret (used to sign requests). |
| `createAuthHeaders` | `createAuthHeaders` | `(opts) => Record<string,string>` / `callable` | No | Custom auth header function. Receives `{ host, path, method }` and should return headers (e.g. `{ Authorization: 'Bearer ...' }`). |


##### ResourceInfo

| TS key | PY key | Type | Required | Description |
|---|---|---|---|---|
| `url` | `url` | `string` / `str` | No | Resource URL that the payment is for (shown to the client). |
| `description` | `description` | `string` / `str` | No | Human-readable description of the resource/charge. |
| `mimeType` | `mimeType` | `string` / `str` | No | MIME type for the resource (e.g. `application/json`). |

## Context Requirements

All priced tools must include a `ctx: Context` / `extra` parameter:

<Tabs>
<TabItem value="python" label="Python">
```python
from mcp.server.fastmcp import Context
@mcp.tool()
@price(amount=1.00, currency="USD")
def my_tool(input: str, ctx: Context) -> str:  # ctx parameter is required for PayMCP integration
    return process_input(input)
```
</TabItem>
<TabItem value="typescript" label="TypeScript">
```ts
mcp.registerTool(
  "my_tool",
  {
    description: "Description",
    inputSchema: { prompt: z.string() },
    _meta: { price: { amount: 0.50, currency: "USD" } },
  },
  async ({ prompt }, extra) => { //extra parameter is required for PayMCP integration
    return process_input(input)
  }
);
```
</TabItem>
</Tabs>

### Why Context/Extra is Required

The `Context`/`extra` parameter provides:
- User identification for payment tracking
- Progress reporting capabilities (PROGRESS mode)
- Elicitation support (ELICITATION mode)
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
| Invalid mode | Unsupported payment mode | Use supported mode |

### Tool Errors

| Error Type | Description | Solution |
|------------|-------------|----------|
| Missing context | No `ctx` parameter | Add `ctx: Context` parameter |
| Invalid amount | Amount less than or equal to 0 or not numeric | Use valid positive amount |

## Advanced Configuration

### Multiple Providers

In Mode.AUTO you can configure Multiple providers (One for clients who supports x402 protocol and one for all other clients)

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(
    mcp,
    providers=[
        X402Provider(payTo=[{"address": "0xYourAddress"}]),
        StripeProvider(apiKey="sk_test_...")
    ],
    mode=Mode.AUTO
)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, {
  providers: [
    new StripeProvider({ apiKey: "sk_test_..." }),
    new X402Provider({payTo:[{"address": "0xYourAddress"}]})
  ],
  mode: Mode.AUTO
});
```

</TabItem>
</Tabs>



## Next Steps

- **[Quickstart Guide](./quickstart)** - Get started with PayMCP
- **[Provider Setup](./providers/stripe)** - Configure your payment provider
- **[Examples](./examples/paid-image-generator)** - See real-world implementations
- **[Troubleshooting](./troubleshooting)** - Common issues and solutions
