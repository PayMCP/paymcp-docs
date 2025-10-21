---
slug: /
title: PayMCP
description: Provider-agnostic payment layer for MCP (Model Context Protocol) tools and agents
---

# PayMCP

Provider-agnostic payment layer for MCP (Model Context Protocol) tools and agents.

PayMCP is a lightweight SDK that helps you add monetization to your MCP-based tools, servers, or agents. It supports multiple payment providers and integrates seamlessly with MCP's tool/resource interface.

## Key Features

- **Simple Integration** - For Python, add `@price(...)` decorators to your MCP tools. For TypeScript, add a `price` variable in `registerTool()` to enable payments
- **Flexible Payment Flows** - Choose between different payment flows (elicit, confirm, progress, etc.)
- **Built-in and Custom Providers** - Most top payment providers are built in, and you can easily add custom providers
- **Framework Agnostic** - Easy integration with FastMCP or other MCP servers
- **Production Ready** - Built for reliability and scale

## Quick Example

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price
from paymcp.providers import StripeProvider

mcp = FastMCP("AI agent name")

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])

@mcp.tool()
@price(amount=1.00, currency="USD")
def add_numbers(a: int, b: int, ctx: Context) -> int:
    """Add two numbers together"""
    return a + b
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { FastMCP } from '@mcp/server-fastmcp';
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';
import type { Context } from '@mcp/server-fastmcp';
import { z } from 'zod';

const mcp = new FastMCP("AI agent name");

installPayMCP(mcp, { providers: [StripeProvider({ apiKey: "sk_test_..." })] });

mcp.tool(
  "add_numbers",
  {
    description: "Add two numbers together",
    inputSchema: { a: z.number(), b: z.number() },
    price: { amount: 1.00, currency: "USD" },
  },
  async ({ a, b }, ctx) => {
    return { content: [{ type: "text", text: String(a + b) }] };
  }
);
```

</TabItem>
</Tabs>

## Payment Flows

PayMCP supports multiple payment flows to fit different use cases:

- **[TWO_STEP](./concepts-and-flows#two_step-flow)** - Split tool execution into initiate/confirm steps (default, most compatible)
- **[ELICITATION](./concepts-and-flows#elicitation-flow)** - Payment link during tool execution (requires elicitation capability from MCP Clients)
- **[PROGRESS](./concepts-and-flows#progress-flow)** - Experimental auto-checking of payment status (requires progress capability from MCP Clients)

See the list of clients and their capabilities here: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)

## Supported Providers

| Provider | Status | Features |
|----------|--------|----------|
| **[Stripe](./providers/stripe)** | ✅ Available | Cards, ACH, international payments |
| **[Walleot](./providers/walleot)** | ✅ Available | Pre-purchased credits, auto payments |
| **[PayPal](./providers/paypal)** | ✅ Available | PayPal balance, cards, bank transfers |
| **[Square](./providers/square)** | ✅ Available | Cards, in-person payments |
| **[Adyen](./providers/adyen)** | ✅ Available | Global payments, 40+ countries |
| **[Coinbase Commerce](./providers/coinbase)** | ✅ Available | Bitcoin, Ethereum, stablecoins |

## Getting Started

1. **[Installation](./quickstart#installation)** - Install PayMCP via pip or npm
2. **[Basic Setup](./quickstart#basic-setup)** - Configure your first provider
3. **[Add Pricing](./quickstart#adding-pricing)** - Monetize your tools
4. **[Test Integration](./quickstart#testing-your-integration)** - Verify everything works


## Security Notice

**PayMCP is NOT compatible with STDIO mode deployments** where end users download and run MCP servers locally. This would expose your payment provider API keys to end users, creating serious security vulnerabilities.

**PayMCP must be deployed as a hosted service** where:
- You control the server environment
- API keys remain secure on your infrastructure  
- Users connect via network protocols (HTTP, WebSocket, etc.)

Ready to start? Check out our **[Quickstart Guide](./quickstart)** to get up and running in minutes.
