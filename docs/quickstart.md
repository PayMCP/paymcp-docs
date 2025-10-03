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
providers = {
    "stripe": {"apiKey": "sk_live_..."},  # NEVER expose this
    "walleot": {"apiKey": "wk_live_..."}  # NEVER expose this
}
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

mcp = FastMCP("My Hosted AI Service")
PayMCP(mcp, providers={
    "stripe": {"apiKey": os.getenv("STRIPE_SECRET_KEY")}  # Secure on your server
})

# Users connect via HTTP/WebSocket, never see the keys
```

## Basic Setup

### 1. Initialize Your MCP Server

```python
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price, PaymentFlow

# Create your MCP server
mcp = FastMCP("My AI Assistant")
```

### 2. Configure PayMCP

PayMCP now supports multiple ways to configure payment providers. Choose the approach that works best for your use case:

#### Option 1: Config Mapping (Default)

```python
# Configure PayMCP with provider configuration
PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": "sk_test_51...",  # Your Stripe secret key
            "success_url": "https://yourapp.com/success",
            "cancel_url": "https://yourapp.com/cancel"
        }
    },
    payment_flow=PaymentFlow.TWO_STEP  # Default, most compatible
)
```

#### Option 2: Provider Instances (Advanced)

```python
import os
from paymcp.providers import StripeProvider, WalleotProvider, CoinbaseProvider

# Configure with ready-made provider instances
PayMCP(
    mcp,
    providers={
        "stripe": StripeProvider(apiKey=os.getenv("STRIPE_API_KEY")),
        "custom": MyCustomProvider(api_key="...")
    }
)
```

#### Option 3: List of Instances

```python
# Configure with a list of provider instances
PayMCP(
    mcp,
    providers=[
        StripeProvider(apiKey=os.getenv("STRIPE_API_KEY")),
        WalleotProvider(api_key=os.getenv("WALLEOT_API_KEY")),
        CoinbaseProvider(api_key=os.getenv("COINBASE_API_KEY"))
    ]
)
# Note: The first provider in the list is used by default
```

<details>
<summary>More Provider Configuration Examples</summary>

```python
# Walleot (Crypto payments)
PayMCP(mcp, providers={
    "walleot": {"apiKey": "wk_test_..."}
})

# PayPal
PayMCP(mcp, providers={
    "paypal": {
        "client_id": "your_client_id",
        "client_secret": "your_client_secret",
        "sandbox": True
    }
})

# Custom provider with class path
PayMCP(mcp, providers={
    "custom": {
        "class": "my_package.providers:MyProvider",
        "apiKey": "...",
        "custom_config": "value"
    }
})

# Mixed configuration styles
PayMCP(mcp, providers={
    "stripe": {"apiKey": "sk_test_..."},  # Config dict
    "walleot": WalleotProvider(api_key="wk_test_..."),  # Instance
    "custom": MyProvider(...)  # Custom instance
})
```

</details>

## Adding Pricing

### Simple Tool Pricing

Add the `@price` decorator to any MCP tool:

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
def generate_image(prompt: str, ctx: Context) -> str:
    """Generate an AI image from a text prompt."""
    # Your image generation logic here
    return f"Generated image for: {prompt}"
```

### Different Price Points

```python
@mcp.tool()
@price(amount=0.05, currency="USD")  # Micro-payment
def check_grammar(text: str, ctx: Context) -> str:
    """Check and correct grammar in text."""
    return corrected_text

@mcp.tool()
@price(amount=2.99, currency="USD")  # Premium feature
def detailed_analysis(document: str, ctx: Context) -> dict:
    """Perform detailed document analysis."""
    return analysis_results
```

### Currency Support

Currency support depends on your payment provider. Some providers (like Stripe) allow you to set prices in one currency but accept payments in many others, handling conversion automatically. Please check your provider’s documentation for the full list of supported currencies and conversion rules.

```python
@price(amount=1.50, currency="EUR")  # Euros
@price(amount=100, currency="JPY")   # Japanese Yen
@price(amount=0.001, currency="BTC") # Bitcoin (Walleot/Coinbase)
```

## Payment Flows

Choose the payment flow that works best for your use case:

### TWO_STEP (Default - Most Compatible)

Best for most applications. Splits payment into two steps:

```python
PayMCP(mcp, providers={"stripe": {...}}, payment_flow=PaymentFlow.TWO_STEP)

# When user calls your tool:
# 1. Returns payment link and confirmation method
# 2. User pays and calls confirm_toolname_payment()
# 3. Tool executes after payment confirmation
```

### ELICITATION (Interactive)

For real-time interactions:

```python
PayMCP(mcp, providers={"stripe": {...}}, payment_flow=PaymentFlow.ELICITATION)

# Shows payment UI immediately when tool is called (if supported by client)
# Waits for payment before proceeding
```

### PROGRESS (Background Processing)

For long-running operations:

```python
PayMCP(mcp, providers={"stripe": {...}}, payment_flow=PaymentFlow.PROGRESS)

# Shows payment link and progress indicator (if supported by client)
# Automatically proceeds when payment is received
```

See the list of MCP clients and their capabilities here: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)

## Testing Your Integration

### 1. Start Your Server

```python
# server.py
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price, PaymentFlow

mcp = FastMCP("Test Server")
PayMCP(mcp, providers={"stripe": {"apiKey": "sk_test_..."}})

@mcp.tool()
@price(amount=0.01, currency="USD")  # Test with 1 cent
def hello_world(name: str, ctx: Context) -> str:
    return f"Hello, {name}! Payment successful."

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

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
- [ ] Set up webhook endpoints (if required by provider)
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

## Migration to 0.2.0

### From Config Mapping to Provider Instances

If you're upgrading from earlier versions, you can gradually migrate:

```python
# Before (0.1.x) - still works in 0.2.0
PayMCP(mcp, providers={
    "stripe": {"apiKey": "sk_test_..."}
})

# After (0.2.0+) - new provider instance approach
from paymcp.providers import StripeProvider
PayMCP(mcp, providers=[
    StripeProvider(apiKey="sk_test_...")
])
```

### Benefits of New Configuration Methods

**Type Safety & IDE Support:**
```python
# Provider instances offer better type checking
stripe_provider = StripeProvider(
    apiKey="sk_test_...",
    success_url="https://app.com/success",  # IDE autocomplete
    cancel_url="https://app.com/cancel"     # Type validation
)
```

**Dynamic Configuration:**
```python
# Easier to configure providers dynamically
providers = []
if os.getenv("STRIPE_API_KEY"):
    providers.append(StripeProvider(apiKey=os.getenv("STRIPE_API_KEY")))
if os.getenv("WALLEOT_API_KEY"):
    providers.append(WalleotProvider(api_key=os.getenv("WALLEOT_API_KEY")))

PayMCP(mcp, providers=providers)
```

### Custom Provider Development

0.2.0 makes it easier to create and use custom providers:

```python
from paymcp.providers import BasePaymentProvider, register_provider

class CustomProvider(BasePaymentProvider):
    def create_payment(self, amount: float, currency: str, description: str):
        return "payment_id", "https://example.com/pay"
    
    def get_payment_status(self, payment_id: str) -> str:
        return "paid"

# Option 1: Use directly as instance
PayMCP(mcp, providers=[CustomProvider(api_key="...")])

# Option 2: Register for config mapping
register_provider("custom-gateway", CustomProvider)
PayMCP(mcp, providers={"custom-gateway": {"api_key": "..."}})

# Option 3: Use class path
PayMCP(mcp, providers={
    "custom": {
        "class": "my_package.providers:CustomProvider",
        "api_key": "...",
        "custom_config": "value"
    }
})
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
