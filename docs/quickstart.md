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
- An MCP server framework (Official MCP SDK recommended)  
- **Hosted server environment** (not STDIO mode)
- API keys from your chosen payment provider


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
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

const mcp = new McpServer({name: "My AI Assistant"});
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

mcp.registerTool(
  "generate_ai_image",
  {
    description: "Generate an AI image from a text prompt",
    inputSchema: { prompt: z.string() },
    _meta: { price: { amount: 0.50, currency: "USD" } },
  },
  async ({ prompt }, extra) => {
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

mcp.registerTool(
  "check_text_grammar",
  {
    description: "Check and correct grammar in text",
    inputSchema: { text: z.string() },
    _meta: { price: { amount: 0.05, currency: "USD" } },
  },
  async ({ text }, extra) => {
    return { content: [{ type: "text", text: correctedText }] };
  }
);

mcp.registerTool(
  "analyze_document",
  {
    description: "Perform detailed document analysis",
    inputSchema: { document: z.string() },
    _meta: { price: { amount: 2.99, currency: "USD" } },
  },
  async ({ document }, extra) => {
    return { content: [{ type: "text", text: JSON.stringify(analysisResults) }] };
  }
);
```

</TabItem>
</Tabs>


## Subscriptions

Gate tools behind an active subscription instead of pay-by-request.

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp import subscription

@mcp.tool()
@subscription(plan="price_pro_monthly")  # or a list of accepted plan IDs
async def generate_report(ctx: Context) -> str:
    return "Your report"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
mcp.registerTool(
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

## Coordination Modes

Choose the mode (AUTO, RESUBMIT, ELICITATION, TWO_STEP, X402, PROGRESS, or DYNAMIC_TOOLS) that works best for your use case:

### AUTO (Default)

Automatically detects client capabilities. If X402 is configured and supported by the client, it uses `X402`; otherwise it uses `ELICITATION` when supported and falls back to `RESUBMIT`.

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], mode=Mode.AUTO)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    mode: Mode.AUTO
});
```

</TabItem>
</Tabs>

### RESUBMIT (Retry-after-error)

Adds an optional `payment_id` to the original tool signature.


<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], mode=Mode.RESUBMIT)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    mode: Mode.RESUBMIT 
});
```

</TabItem>
</Tabs>

**Call sequence**
1. First call: PayMCP invokes the tool without a `payment_id`, responds with Payment Required Error containing a `payment_url` plus `payment_id`, and instructs the client to retry.
2. Second call: The client calls the same tool again with the returned `payment_id`; PayMCP validates payment server-side and runs your original tool logic if paid.


### ELICITATION (Interactive)

For real-time interactions.

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], mode=Mode.ELICITATION)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    mode: Mode.ELICITATION 
});
```

</TabItem>
</Tabs>

Shows payment link immediately when tool is called (if supported by client)
Waits for payment confirmation before proceeding


### TWO_STEP

Splits tool execution into two steps.

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], mode=Mode.TWO_STEP)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    mode: Mode.TWO_STEP
});
```

</TabItem>
</Tabs>

Confirmation tool will be added automatically.

### X402 (On-chain)

Use this mode only with an x402-capable client and the X402 provider. See the [X402 Provider guide](./providers/x402) for setup details.

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[X402Provider(pay_to=[{"address": "0xAddress"}])], mode=Mode.X402)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new X402Provider({"payTo":[{"address": "0xAddress"}]})],
    mode: Mode.X402 
});
```

</TabItem>
</Tabs>

By default PayMCP uses the public facilitator at `https://facilitator.paymcp.info` and no API keys are required. To change facilitators, set `facilitator.url`. The Coinbase CDP facilitator (`https://api.cdp.coinbase.com/platform/v2/x402`) requires `apiKeyId` and `apiKeySecret`.



### PROGRESS (Experimental)

For experimental auto-checking of payment status.

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], mode=Mode.PROGRESS)
```
</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    mode: Mode.PROGRESS 
});
```

</TabItem>
</Tabs>

Shows payment link and progress indicator (if supported by client)
Automatically proceeds when payment is received

### DYNAMIC_TOOLS (Guided Tool Lists)

For clients that support dynamic tool lists and `listChanged` notifications:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(
    mcp,
    providers=[StripeProvider(apiKey="sk_test_...")],
    mode=Mode.DYNAMIC_TOOLS
)

# Temporarily hides/shows tools to steer the next valid action
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, {
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    mode: Mode.DYNAMIC_TOOLS
});

// Temporarily hides/shows tools to steer the next valid action
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
import { installPayMCP, RedisStateStore } from "paymcp";

const redisClient = createClient({ url: "redis://localhost:6379" });
await redisClient.connect();

installPayMCP(mcp, {
  providers: [ /* ... */ ],
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
    mcp.run(transport="streamable-http")
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// server.ts
import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server';
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';
import { z } from 'zod';

const mcp = new McpServer({name:"Test Server"});
installPayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });

mcp.registerTool(
  "test_payment_integration",
  {
    description: "Test payment integration with greeting",
    inputSchema: { name: z.string() },
    _meta: { price: { amount: 1.00, currency: "USD" } },
  },
  async ({ name }, extra) => {
    return { content: [{ type: "text", text: `Hello, ${name}! Payment successful.` }] };
  }
);

async function main() {
    const transport = new StdioServerTransport();
    await mcp.connect(transport);
    console.log('MCP server is running...');
}

main().catch(error => {
    console.error('Server error:', error);
    process.exit(1);
});
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
- **USDC (Base)**: Use Base-sepolia network (eip155:84532)
- **USDC (Solana)**: Use devnet network (solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1)

## Next Steps

✅ **Basic setup complete!** Your MCP tools will now ask for payment before running.

### Explore More:

- **[Coordination Modes](./concepts-and-flows)** - Learn about different coordination modes
- **[Provider Guides](./providers/stripe)** - Provider-specific configuration
- **[Examples](./examples/paid-image-generator)** - Real-world implementation examples

Need help? Check our [troubleshooting guide](./troubleshooting) or [open an issue](https://github.com/PayMCP/paymcp/issues).
