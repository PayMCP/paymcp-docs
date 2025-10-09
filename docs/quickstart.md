---
id: quickstart
title: Quickstart
description: Get started with PayMCP in minutes - install, configure, and monetize your first MCP tool
---

# Quickstart

Get PayMCP up and running in your MCP server in just a few minutes.

## Installation

Install PayMCP from PyPI using pip:

```bash
pip install paymcp
```

**⚠️ Security Notice:** PayMCP is only for hosted deployments, not STDIO mode.

### Requirements

- Python 3.8+
- An MCP server framework (FastMCP recommended)  
- **Hosted server environment** (NOT STDIO mode)
- API keys from your chosen payment provider (kept secure on your server)

## 🚨 Deployment Security

### Why PayMCP Requires Hosted Deployment

PayMCP contains sensitive payment provider API keys that must never be exposed to end users:

```python
# These are SECRET and must stay on YOUR server
providers = [
    StripeProvider(apiKey="sk_live_..."),  # NEVER expose this
    WalleotProvider(api_key="wk_live_...")  # NEVER expose this
]
```

### STDIO Mode is Incompatible

❌ **Don't do this:** Distribute MCP servers with PayMCP to end users
- Users download and run your server locally
- Your API keys are exposed in their environment
- Users could extract and misuse your payment credentials

✅ **Do this:** Host your PayMCP server
- Deploy to your own infrastructure (AWS, GCP, etc.)
- Users connect via network protocols
- API keys remain secure on your servers

### Recommended Deployment

```python
# Deploy this on YOUR infrastructure, not user machines
from mcp.server.fastmcp import FastMCP
from paymcp import PayMCP
from paymcp.providers import StripeProvider

mcp = FastMCP("My Hosted AI Service")
PayMCP(mcp, providers=[
    StripeProvider(apiKey=os.getenv("STRIPE_SECRET_KEY"))  # Secure on your server
])

# Users connect via HTTP/WebSocket, never see the keys
```

## Basic Setup

### 1. Initialize Your MCP Server

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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
import { PayMCP, price } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';
import type { Context } from '@mcp/server-fastmcp';

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
new PayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });
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
server.registerTool(
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
server.registerTool(
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

server.registerTool(
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

Best for most applications. Splits payment into two steps:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], payment_flow=PaymentFlow.TWO_STEP)

# When user calls your tool:
# 1. Returns payment link and confirmation method
# 2. User pays and calls confirm_toolname_payment()
# 3. Tool executes after payment confirmation
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
new PayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    payment_flow: PaymentFlow.TWO_STEP 
});

// When user calls your tool:
// 1. Returns payment link and confirmation method
// 2. User pays and calls confirm_toolname_payment()
// 3. Tool executes after payment confirmation
```

</TabItem>
</Tabs>

### ELICITATION (Interactive)

For real-time interactions:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], payment_flow=PaymentFlow.ELICITATION)

# Shows payment UI immediately when tool is called (if supported by client)
# Waits for payment before proceeding
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
new PayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    payment_flow: PaymentFlow.ELICITATION 
});

// Shows payment UI immediately when tool is called (if supported by client)
// Waits for payment before proceeding
```

</TabItem>
</Tabs>

### PROGRESS (Background Processing)

For long-running operations:

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
new PayMCP(mcp, { 
    providers: [new StripeProvider({ apiKey: "sk_test_..." })],
    payment_flow: PaymentFlow.PROGRESS 
});

// Shows payment link and progress indicator (if supported by client)
// Automatically proceeds when payment is received
```

</TabItem>
</Tabs>

See the list of MCP clients and their capabilities here: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)

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
@price(amount=0.01, currency="USD")
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
import { PayMCP, price } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

const mcp = new FastMCP("Test Server");
new PayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });

server.registerTool(
  "test_payment_integration",
  {
    description: "Test payment integration with greeting",
    inputSchema: { name: z.string() },
    price: { amount: 0.01, currency: "USD" },
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
- **[Production Deployment](#production-checklist)** - Go-live checklist

## Production Checklist

Before going live:

- [ ] **CRITICAL: Verify hosted deployment** (NOT STDIO mode)
- [ ] **CRITICAL: Confirm API keys are server-side only**
- [ ] Switch to production API keys
- [ ] Test with real small amounts
- [ ] Implement proper error handling
- [ ] Add logging and monitoring

## Common Issues

### Tool Not Found Error
Make sure the `ctx: Context` parameter is included in your tool signature:

```python
# ❌ Wrong
@price(amount=0.50, currency="USD")
def my_tool(input: str) -> str:
    pass

# ✅ Correct
@price(amount=0.50, currency="USD")
def my_tool(input: str, ctx: Context) -> str:
    pass
```

### Provider Authentication Error
Verify your API keys are correct and have the right permissions:

```python
# Check your provider dashboard for correct keys
providers={"stripe": {"apiKey": "sk_test_..."}}  # Should start with sk_test_ or sk_live_
```


## Deployment Options

### ✅ Secure Hosted Deployment (Required)

Deploy your MCP server on cloud infrastructure:

**Popular Options:**
- **Railway**: Simple deployment with environment variables
- **Heroku**: Easy Git-based deployment  
- **AWS Lambda**: Serverless with API Gateway
- **Google Cloud Run**: Containerized deployment
- **DigitalOcean App Platform**: Managed hosting
- **Your own VPS**: Full control deployment

**Example Railway Deployment:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy your MCP server
railway login
railway init
railway add  # Add environment variables for API keys
railway up
```

**Example Docker Deployment:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install paymcp
CMD ["python", "server.py"]
```

### ❌ STDIO Mode (Prohibited)

**If you use PayMCP – never allow users to download your code and run it in STDIO mode:**
- Users would download your server code
- Payment API keys would be exposed
- Creates massive security vulnerability
- Violates payment provider terms of service

Need help? Check our [troubleshooting guide](./troubleshooting) or [open an issue](https://github.com/PayMCP/paymcp/issues).
