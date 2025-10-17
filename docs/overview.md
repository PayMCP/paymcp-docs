---
id: overview
title: PayMCP Overview
slug: /paymcp/overview
---

# PayMCP

Provider-agnostic payment layer for MCP (Model Context Protocol) tools and agents.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

PayMCP is a lightweight SDK that helps you add monetization to your MCP-based tools, servers, or agents. It supports multiple payment providers and integrates seamlessly with MCP's tool/resource interface.

## Features

Add `@price(...)` decorators to your MCP tools to enable payments  
Choose between different payment flows (elicit, confirm, etc.)  
Pluggable support for providers like Walleot, Stripe, and more  
Easy integration with FastMCP or other MCP servers  

## Payment Flows

The `payment_flow` parameter controls how the user is guided through the payment process. Choose the strategy that fits your use case:

**PaymentFlow.TWO_STEP** (default)  
Splits the tool execution into two separate MCP methods. The first step returns a `payment_url` and a `next_step` method for confirmation. The second method (e.g. `confirm_add_payment`) verifies payment and runs the original logic. Supported in most clients.

**PaymentFlow.ELICITATION**  
Sends the user a payment link when the tool is invoked. If the client supports it, the payment link is displayed immediately. Once the user completes payment, the tool proceeds.

**PaymentFlow.PROGRESS**  
Shows payment link and a progress indicator while the system waits for payment confirmation in the background. The result is returned automatically once payment is completed.


All flows require the MCP client to support the corresponding interaction pattern. When in doubt, start with TWO_STEP.

## Quickstart

Install the SDK:

<Tabs>
<TabItem value="python" label="Python">

```bash
pip install mcp paymcp
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```bash
npm install @modelcontextprotocol/sdk paymcp
```

</TabItem>
</Tabs>

Initialize PayMCP:

```python
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price, PaymentFlow
import os

mcp = FastMCP("AI agent name")
PayMCP(
    mcp,  # your FastMCP instance
    providers={
        "stripe": {"apiKey": os.getenv("STRIPE_API_KEY")},
    },
    payment_flow=PaymentFlow.TWO_STEP #or ELICITATION / PROGRESS
)
```

### Providers: alternative styles (optional)

**Instances instead of config (advanced):**

```python
import os
from paymcp.providers import WalleotProvider, StripeProvider

PayMCP(
    mcp,
    providers=[
        WalleotProvider(api_key=os.getenv("WALLEOT_API_KEY")),
        CoinbaseProvider(api_key=os.getenv("COINBASE_API_KEY")),
    ],
)
# Note: right now the first configured provider is used.
```

**Custom provider (minimal):**  
Any provider must subclass `BasePaymentProvider` and implement `create_payment(...)` and `get_payment_status(...)`.

```python
from paymcp.providers import BasePaymentProvider

class MyProvider(BasePaymentProvider):

    def create_payment(self, amount: float, currency: str, description: str):
        # Return (payment_id, payment_url)
        return "unique-payment-id", "https://example.com/pay"

    def get_payment_status(self, payment_id: str) -> str:
        return "paid"

PayMCP(mcp, providers=[MyProvider(api_key="...")])
```

Use the `@price` decorator on any tool:

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=0.19, currency="USD")
def add_numbers(a: int, b: int, ctx: Context) -> int:
    """Add two numbers together"""
    return a + b
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
mcp.tool(
  "add_numbers",
  {
    description: "Add two numbers together",
    inputSchema: { a: z.number(), b: z.number() },
    price: { amount: 0.19, currency: "USD" },
  },
  async ({ a, b }, ctx) => {
    return { content: [{ type: "text", text: String(a + b) }] };
  }
);
```

</TabItem>
</Tabs>

**Demo server:** For a complete setup, see the example repo: [python-paymcp-server-demo](https://github.com/PayMCP/python-paymcp-server-demo).

## Security Warning: STDIO Mode Not Supported

**PayMCP cannot be used with STDIO mode deployments.** STDIO mode requires end users to download and run MCP servers locally, which would expose your payment provider API keys.

**PayMCP requires hosted deployment** where:
- You maintain control of the server environment
- Payment provider API keys remain secure
- Users connect via network protocols (HTTP/WebSocket)
- No sensitive credentials are distributed to end users

## Supported Providers

✅ Adyen  
✅ Coinbase Commerce  
✅ PayPal  
✅ Stripe  
✅ Square  
✅ Walleot  

🔜 Want another provider? Open an issue or submit a pull request!
