---
slug: /
title: PayMCP
description: Provider-agnostic payment layer for MCP (Model Context Protocol) tools and agents
---

# PayMCP

Provider-agnostic payment layer for MCP (Model Context Protocol) tools and agents.

PayMCP is a lightweight SDK that helps you add monetization to your MCP-based tools, servers, or agents. It supports multiple payment providers and integrates seamlessly with MCP's tool/resource interface.

Paper: [https://zenodo.org/records/18158720](https://zenodo.org/records/18158720)

## Key Features

- **Simple Integration** - For Python, add the `@price(...)` decorator to your MCP tools. For TypeScript, add price to tool metadata (`_meta.price`)
- **Subscription Gating** - Gate tools behind active subscriptions
- **Built-in and Custom Providers** - Most top payment providers are built in, and you can easily add custom providers
- **Flexible Coordination Modes** - Choose between different payment modes (auto, resubmit, elicitation, two-step, x402, progress, dynamic tools)
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
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';
import { z } from 'zod';

const mcp = new McpServer({name: "My AI Assistant"});

installPayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });

mcp.registerTool(
  "add_numbers",
  {
    description: "Add two numbers together",
    inputSchema: { a: z.number(), b: z.number() },
    _meta: { price: { amount: 1.00, currency: "USD" } },
  },
  async ({ a, b }, extra) => {
    return { content: [{ type: "text", text: String(a + b) }] };
  }
);
```

</TabItem>
</Tabs>

## Coordination Modes

PayMCP supports multiple coordination modes to fit different use cases:

- **[AUTO](./concepts-and-flows#modeauto-default)** - Detects client capabilities; uses elicitation if supported, otherwise falls back to resubmit (default)
- **[RESUBMIT](./concepts-and-flows#moderesubmit)** - First call returns error with a payment ID and payment URL; the retry completes once payment is verified
- **[ELICITATION](./concepts-and-flows#modeelicitation)** - Payment link during tool execution (requires elicitation capability from MCP Clients)
- **[TWO_STEP](./concepts-and-flows#modetwo_step)** - Split tool execution into initiate/confirm steps
- **[X402](./concepts-and-flows#modex402)** - On-chain x402 payment request with signed payment response (requires x402-capable clients)
- **[PROGRESS](./concepts-and-flows#modeprogress)** - Experimental auto-checking of payment status (requires progress capability from MCP Clients)
- **[DYNAMIC_TOOLS](./concepts-and-flows#modedynamic_tools)** - Dynamic tool lists that expose the next valid action (requires listChanged support from MCP Clients)

See the list of clients and their capabilities here: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)

## Supported Providers

| Provider | Pay-per-request | Subscription | Features |
|----------|--------|----------|----------|
| **[Stripe](./providers/stripe)** | ✅ | ✅ | Cards, ACH, international payments |
| **[Walleot](./providers/walleot)** | ✅ |  | Pre-purchased credits, auto payments |
| **[PayPal](./providers/paypal)** | ✅ |  | PayPal balance, cards, bank transfers |
| **[Square](./providers/square)** | ✅ |  | Cards, in-person payments |
| **[Adyen](./providers/adyen)** | ✅ |  | Global payments, 40+ countries |
| **[Coinbase Commerce](./providers/coinbase)** | ✅ |  | Bitcoin, Ethereum, stablecoins |
| **[X402](./providers/x402)** | ✅ |  | On-chain x402 payments (Base/Solana) |

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
