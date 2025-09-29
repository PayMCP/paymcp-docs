---
slug: /
title: PayMCP
description: Provider-agnostic payment layer for MCP (Model Context Protocol) tools and agents
---

# PayMCP

Provider-agnostic payment layer for MCP (Model Context Protocol) tools and agents.

PayMCP is a lightweight SDK that helps you add monetization to your MCP-based tools, servers, or agents. It supports multiple payment providers and integrates seamlessly with MCP's tool/resource interface.

## Key Features

- **🔧 Simple Integration** - Add `@price(...)` decorators to your MCP tools to enable payments
- **🔁 Flexible Payment Flows** - Choose between different payment flows (elicit, confirm, progress, etc.)
- **🔌 Extensible Provider System** - Configure providers as config mappings, instances, or lists with built-in and custom providers
- **⚙️ Framework Agnostic** - Easy integration with FastMCP or other MCP servers
- **🎯 Production Ready** - Built for reliability and scale

## Quick Example

```python
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price, PaymentFlow

mcp = FastMCP("AI agent name")

# Configure PayMCP with your provider
PayMCP(
    mcp,
    providers={
        "stripe": {"apiKey": "sk_test_..."},
    },
    payment_flow=PaymentFlow.ELICITATION
)

# Add pricing to any tool
@mcp.tool()
@price(amount=0.19, currency="USD")
def add(a: int, b: int, ctx: Context) -> int:
    return a + b
```

## Payment Flows

PayMCP supports multiple payment flows to fit different use cases:

- **[TWO_STEP](./concepts-and-flows#two_step-flow)** - Split into initiate/confirm steps (default, most compatible)
- **[ELICITATION](./concepts-and-flows#elicitation-flow)** - Interactive payment during tool execution
- **[PROGRESS](./concepts-and-flows#progress-flow)** - Background payment with progress updates
- **[OOB](./concepts-and-flows#oob-flow-coming-soon)** - Out-of-band payment (coming soon)

## Supported Providers

| Provider | Status | Features |
|----------|--------|----------|
| **[Stripe](./providers/stripe)** | ✅ Available | Cards, ACH, international payments |
| **[Walleot](./providers/walleot)** | ✅ Available | Crypto payments, instant settlement |
| **[PayPal](./providers/paypal)** | ✅ Available | PayPal balance, cards, bank transfers |
| **[Square](./providers/square)** | ✅ Available | Cards, in-person payments |
| **[Adyen](./providers/adyen)** | ✅ Available | Global payments, 40+ countries |
| **[Coinbase Commerce](./providers/coinbase)** | ✅ Available | Bitcoin, Ethereum, stablecoins |

## Getting Started

1. **[Installation](./quickstart#installation)** - Install PayMCP via pip
2. **[Basic Setup](./quickstart#basic-setup)** - Configure your first provider
3. **[Add Pricing](./quickstart#adding-pricing)** - Monetize your tools
4. **[Test Integration](./quickstart#testing-your-integration)** - Verify everything works

## Example Use Cases

- **[Paid Image Generator](./examples/paid-image-generator)** - Charge per image generation
- **[Premium Q&A Bot](./examples/premium-qa-bot)** - Freemium model with paid premium features
- **[Subscription Tool](./examples/subscription-tool)** - Monthly subscription access

## Architecture

PayMCP sits between your MCP tools and payment providers, handling:

- Payment initiation and confirmation
- Provider abstraction and failover
- Flow management (sync/async)
- Secure hosted deployment model
- Error handling and retries

## ⚠️ Critical Security Notice

**PayMCP is NOT compatible with STDIO mode deployments** where end users download and run MCP servers locally. This would expose your payment provider API keys to end users, creating serious security vulnerabilities.

**PayMCP must be deployed as a hosted service** where:
- You control the server environment
- API keys remain secure on your infrastructure  
- Users connect via network protocols (HTTP, WebSocket, etc.)

Ready to start? Check out our **[Quickstart Guide](./quickstart)** to get up and running in minutes.
