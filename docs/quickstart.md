---
id: quickstart
title: Quickstart
description: Get started with PayMCP in minutes - install, configure, and monetize your first MCP tool
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart

Get PayMCP up and running in your MCP server in just a few minutes.

## Installation

Install PayMCP:

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

### Requirements

- Python 3.8+ or Node.js 16+
- An MCP server framework (FastMCP recommended)  
- **Hosted server environment** (not STDIO mode)
- API keys from your chosen payment provider (kept secure on your server)


## Basic Setup

### 1. Initialize Your MCP Server

<Tabs>
<TabItem value="python" label="Python">

```python
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price
from paymcp.providers import StripeProvider

mcp = FastMCP("My AI Assistant")
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { FastMCP } from '@mcp/server-fastmcp';
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';
import type { Context } from '@mcp/server-fastmcp';
import { z } from 'zod';

const mcp = new FastMCP("My AI Assistant");
```

</TabItem>
</Tabs>

### 2. Configure PayMCP

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });
```

</TabItem>
</Tabs>


## Adding Pricing

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
def generate_ai_image(prompt: str, ctx: Context) -> str:
    """Generate an AI image from a text prompt"""
    return f"Generated image for: {prompt}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { z } from 'zod';

mcp.tool(
  "generate_ai_image",
  {
    description: "Generate an AI image from a text prompt",
    inputSchema: { prompt: z.string() },
    price: { amount: 0.50, currency: "USD" },
  },
  async ({ prompt }, ctx) => {
    return { content: [{ type: "text", text: `Generated image for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>

### Different Price Points

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=0.05, currency="USD")
def check_text_grammar(text: str, ctx: Context) -> str:
    """Check and correct grammar in text"""
    return corrected_text

@mcp.tool()
@price(amount=2.99, currency="USD")
def analyze_document(document: str, ctx: Context) -> dict:
    """Perform detailed document analysis"""
    return analysis_results
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { z } from 'zod';

mcp.tool(
  "check_text_grammar",
  {
    description: "Check and correct grammar in text",
    inputSchema: { text: z.string() },
    price: { amount: 0.05, currency: "USD" },
  },
  async ({ text }, ctx) => {
    return { content: [{ type: "text", text: correctedText }] };
  }
);

mcp.tool(
  "analyze_document",
  {
    description: "Perform detailed document analysis",
    inputSchema: { document: z.string() },
    price: { amount: 2.99, currency: "USD" },
  },
  async ({ document }, ctx) => {
    return { content: [{ type: "text", text: JSON.stringify(analysisResults) }] };
  }
);
```

</TabItem>
</Tabs>


## Payment Flows

Choose the payment flow that works best for your use case:

### TWO_STEP (Default - Most Compatible)

Best for most applications. Splits tool execution into two steps:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], payment_flow=PaymentFlow.TWO_STEP)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    paymentFlow: PaymentFlow.TWO_STEP
});
```

</TabItem>
</Tabs>

### ELICITATION (Interactive)

For real-time interactions:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], payment_flow=PaymentFlow.ELICITATION)

# Shows payment link immediately when tool is called (if supported by client)
# Waits for payment confirmation before proceeding
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    paymentFlow: PaymentFlow.ELICITATION 
});

// Shows payment link immediately when tool is called (if supported by client)
// Waits for payment confirmation before proceeding
```

</TabItem>
</Tabs>

### PROGRESS (Experimental)

For experimental auto-checking of payment status:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], payment_flow=PaymentFlow.PROGRESS)

# Shows payment link and progress indicator (if supported by client)
# Automatically proceeds when payment is received
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    paymentFlow: PaymentFlow.PROGRESS 
});

// Shows payment link and progress indicator (if supported by client)
// Automatically proceeds when payment is received
```

</TabItem>
</Tabs>

See the list of MCP clients and their capabilities here: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)


## Configuring StateStore

By default, PayMCP uses an in-memory StateStore, which does not persist across server restarts. It's highly recommended to use RedisStateStore in production environments.

<Tabs>
<TabItem value="python" label="Python">

```python
from redis.asyncio import from_url
from paymcp import PayMCP, RedisStateStore

redis = await from_url("redis://localhost:6379")
PayMCP(
    mcp,
    providers=[''' ... ''' ],
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
  providers: [ /* ... */ ],
  paymentFlow: PaymentFlow.TWO_STEP,
  stateStore: new RedisStateStore(redisClient),
});
```

</TabItem>
</Tabs>



## Testing Your Integration

### 1. Start Your Server

<Tabs>
<TabItem value="python" label="Python">

```python
# server.py
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price
from paymcp.providers import StripeProvider

mcp = FastMCP("Test Server")
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])

@mcp.tool()
@price(amount=1.00, currency="USD")
def test_payment_integration(name: str, ctx: Context) -> str:
    """Test payment integration with greeting"""
    return f"Hello, {name}! Payment successful."

if __name__ == "__main__":
    mcp.run()
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// server.ts
import { FastMCP } from '@mcp/server-fastmcp';
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';
import { z } from 'zod';

const mcp = new FastMCP("Test Server");
installPayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });

mcp.tool(
  "test_payment_integration",
  {
    description: "Test payment integration with greeting",
    inputSchema: { name: z.string() },
    price: { amount: 1.00, currency: "USD" },
  },
  async ({ name }, ctx) => {
    return { content: [{ type: "text", text: `Hello, ${name}! Payment successful.` }] };
  }
);

mcp.run();
```

</TabItem>
</Tabs>


### 2. Connect Your MCP Client

For testing, we recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

1. Run your MCP server code.
2. Check the console for the `/mcp` URL (e.g. `http://127.0.0.1:8000/mcp`).
3. Start the inspector with:
   ```bash
   npx @modelcontextprotocol/inspector@latest
   ```
4. In MCP Inspector, select **streamable HTTP** as the transport type and enter your `/mcp` URL.

### 3. Use Test Credentials

**Always use test/sandbox credentials during development:**

- **Stripe**: Use `sk_test_...` keys and test card `4242424242424242`
- **PayPal**: Set `sandbox=True`
- **Square**: Use sandbox environment
- **Walleot**: Use test API keys
- **Coinbase Commerce**: No sandbox is available, so test with very small amounts.

## Next Steps

✅ **Basic setup complete!** Your MCP tools will now ask for payment before running.

### Explore More:

- **[Payment Flows](./concepts-and-flows)** - Learn about different payment patterns
- **[Provider Guides](./providers/stripe)** - Provider-specific configuration
- **[Examples](./examples/paid-image-generator)** - Real-world implementation examples

Need help? Check our [troubleshooting guide](./troubleshooting) or [open an issue](https://github.com/PayMCP/paymcp/issues).
