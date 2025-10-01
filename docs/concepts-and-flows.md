---
id: concepts-and-flows
title: Payment Flows
description: Understanding PayMCP architecture and choosing the right payment flow for your use case
---

# Payment Flows

PayMCP provides flexible payment flows to handle different interaction patterns between your MCP tools and users/agents. Choose the flow that best fits your application's needs.

## Core Concepts

### Payment Providers

PayMCP provides an extensible provider system that abstracts payment providers behind a common interface. Providers can be supplied in multiple ways to give you maximum flexibility:

```python
# Same tool works with any provider configuration style
@price(amount=1.00, currency="USD")
def my_tool(input: str, ctx: Context) -> str:
    return "Tool executed successfully"
```

#### Configuration Methods

**1. Config Mapping (Existing Behavior)**
```python
PayMCP(mcp, providers={
    "stripe": {"apiKey": "sk_test_..."},
    "walleot": {"apiKey": "wk_test_..."}
})
```

**2. Ready-Made Instances**
```python
from paymcp.providers import StripeProvider, WalleotProvider

PayMCP(mcp, providers={
    "stripe": StripeProvider(apiKey="sk_test_..."),
    "custom": MyCustomProvider(api_key="...")
})
```

**3. List of Instances**
```python
PayMCP(mcp, providers=[
    StripeProvider(apiKey=os.getenv("STRIPE_API_KEY")),
    WalleotProvider(api_key=os.getenv("WALLEOT_API_KEY")),
    MyProvider(...)
])
```

This flexibility allows you to:
- Mix different configuration styles in the same setup
- Use custom providers alongside built-in ones
- Dynamically configure providers at runtime
- Share provider instances across multiple PayMCP setups

#### Custom Provider Development

Creating custom providers is straightforward. Any provider must subclass `BasePaymentProvider` and implement the required methods:

```python
from paymcp.providers import BasePaymentProvider

class MyProvider(BasePaymentProvider):
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        super().__init__(**kwargs)
    
    def create_payment(self, amount: float, currency: str, description: str):
        # Implement payment creation logic
        # Return (payment_id, payment_url)
        payment_id = self._create_payment_with_api(amount, currency, description)
        payment_url = f"https://myprovider.com/pay/{payment_id}"
        return payment_id, payment_url
    
    def get_payment_status(self, payment_id: str) -> str:
        # Return "paid", "pending", "failed", or "cancelled"
        return self._check_payment_status(payment_id)

# Use with any configuration method
PayMCP(mcp, providers=[MyProvider(api_key="...")])
```

You can also register custom providers for use with config mappings:

```python
from paymcp.providers import register_provider

register_provider("my-gateway", MyProvider)

# Now use with config mapping
PayMCP(mcp, providers={
    "my-gateway": {"api_key": "...", "custom_option": "value"}
})
```

### Tool Decoration

The `@price` decorator adds payment requirements to your MCP tools without changing their core functionality:

```python
# Regular MCP tool
@mcp.tool()
def analyze_text(text: str, ctx: Context) -> dict:
    """Tool description"""
    #Your code goes here
    return {"analysis": "detailed results"}

# Same tool with payment requirement
@mcp.tool()
@price(amount=0.25, currency="USD")
def analyze_text(text: str, ctx: Context) -> dict:
    return {"analysis": "detailed results"}
```

## Payment Flows

The `payment_flow` parameter determines how users interact with your paid tools. Each flow is optimized for different scenarios.

### TWO_STEP Flow

The default flow splits your tool into two tools: one to receive the task and return a payment link, and another one to confirm payment and execute the code. You don’t need to change your function code — just write your tool as usual, and PayMCP will automatically create both tools.

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.TWO_STEP)

@mcp.tool()
@price(amount=0.50, currency="USD")
def generate_report(data: str, ctx: Context) -> str:
    return f"Report generated for: {data}"
```

Under the hood, PayMCP will replace your `generate_report` tool so that it first returns a payment link, and will automatically add an additional tool `confirm_generate_report_payment` that actually runs your original code after the payment is completed.

**User Experience:**
```
User: "Get me sales report"
LLM: tool call → generate_report("sales data")
MCP server: Returns payment link
User: [Pays] → "I paid"
LLM: tool call → confirm_generate_report_payment(payment_id)
MCP server: Executes generate_report() → Returns actual report
```

**Advantages:**
- ✅ Works with all MCP clients
- ✅ Clear separation of payment and execution
- ✅ User controls when to proceed
- ✅ Can handle payment failures gracefully

**Disadvantages:**
- ❌ Doubles the number of tools in your MCP server, which may confuse LLMs. It’s generally not recommended to have more than 3–4 tools in one MCP server.

### ELICITATION Flow


Prompts the user for payment during tool execution and waits for completion:

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.ELICITATION)

@mcp.tool()
@price(amount=0.25, currency="USD")
def quick_analysis(text: str, ctx: Context) -> str:
    """Tool description"""
    # Your code goes here
    return f"Analysis: {text} processed successfully"
```

**User Experience:**
```
User: "Can you quickly analyze current market trends?"
LLM: tool call → quick_analysis("market trends")
MCP server: Returns payment link
User: [Pays] -> Confirm payment
MCP server: Executes quick_analysis() → Returns result
```

**Advantages:**
- ✅ Single interaction
- ✅ Seamless user experience
- ✅ Immediate execution after payment

**Disadvantages:**
- ❌ Requires MCP client support for elicitation. See which clients support it here: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)

### PROGRESS Flow

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.PROGRESS)

@mcp.tool()
@price(amount=2.00, currency="USD")
def process_large_dataset(dataset_url: str, ctx: Context) -> dict:
    """Tool description"""
    # Your code goes here
    return {"processing": "completed", "results": "..."}
```

**User Experience:**
```
User: "Please process this large dataset: http://data.csv"
LLM: tool call → process_large_dataset("http://data.csv")
MCP server: Returns progress indicator and payment link in a progress message
User: [Pays]
MCP server: "Payment received — generating result..."
MCP server: Executes process_large_dataset() → Returns results
```

**Advantages:**
- ✅ Non-blocking payment process
- ✅ Real-time progress updates
- ✅ Automatic execution after payment

**Disadvantages:**
- ❌ Holds the tool execution thread
- ❌ Timeout duration depends on the client
- ❌ Requires progress reporting support that can display progress messages (not just percentages)

### OOB Flow (Coming Soon)

(Coming Soon)

## Advanced Configuration

### Custom Success/Cancel URLs

Configure where users go after payment:

```python
PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": "sk_test_...",
            "success_url": "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://yourapp.com/cancel"
        }
    }
)
```

### Secure Deployment

PayMCP must be deployed as a hosted service to protect payment provider API keys:

```python
# Deploy on your secure infrastructure
# Users connect via network protocols
# API keys never leave your servers
```


### Multiple Providers (coming soon)

Configure multiple providers using any combination of configuration styles:

```python
from paymcp.providers import StripeProvider, WalleotProvider

PayMCP(
    mcp,
    providers={
        "stripe": {"apiKey": "sk_..."},  # Config mapping
        "paypal": PayPalProvider(client_id="...", client_secret="..."),  # Instance
        "walleot": {"apiKey": "wk_..."}  # Config mapping
    }
)
# Uses the first provider by default
# TODO: Provider selection and failover coming soon
```


## Next Steps

- **[Provider Setup](./providers/stripe)** - Configure your payment provider
- **[Examples](./examples/paid-image-generator)** - See flows in action
- **[API Reference](./api-reference)** - Detailed parameter documentation
