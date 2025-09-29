---
id: concepts-and-flows
title: Payment Flows
description: Understanding PayMCP architecture and choosing the right payment flow for your use case
---

# Payment Flows

PayMCP provides flexible payment flows to handle different interaction patterns between your MCP tools and users. Choose the flow that best fits your application's needs.

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

**Best for:** Most applications, maximum compatibility

The default flow splits payment into two distinct steps:

1. **Initiate**: User calls the tool → Returns payment link + confirmation method
2. **Confirm**: User pays → Calls confirmation tool → Original tool executes

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.TWO_STEP)

@mcp.tool()
@price(amount=0.50, currency="USD")
def generate_report(data: str, ctx: Context) -> str:
    return f"Report generated for: {data}"
```

**User Experience:**
```
User: "generate_report('sales data')"
AI: Returns payment link and "confirm_generate_report_payment" method
User: [Pays] → Calls confirm_generate_report_payment(payment_id)
AI: Executes generate_report() → Returns actual report
```

**Advantages:**
- ✅ Works with all MCP clients
- ✅ Clear separation of payment and execution
- ✅ User controls when to proceed
- ✅ Can handle payment failures gracefully

**Disadvantages:**
- ❌ Requires two API calls
- ❌ More complex user experience

### ELICITATION Flow

**Best for:** Interactive applications, real-time tools

Prompts the user for payment during tool execution and waits for completion:

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.ELICITATION)

@mcp.tool()
@price(amount=0.25, currency="USD")
def quick_analysis(text: str, ctx: Context) -> str:
    return f"Analysis: {text} processed successfully"
```

**User Experience:**
```
User: "quick_analysis('market trends')"
AI: Shows payment UI immediately
User: [Pays via payment link]
AI: Automatically executes quick_analysis() → Returns result
```

**Advantages:**
- ✅ Single interaction
- ✅ Seamless user experience
- ✅ Immediate execution after payment
- ✅ Works with hosted payment pages

**Disadvantages:**
- ❌ Requires MCP client support for elicitation (coming in MCP spec)
- ❌ User must complete payment to continue

### PROGRESS Flow

**Best for:** Long-running operations, background processing

Shows payment link and progress updates while waiting for payment in the background:

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.PROGRESS)

@mcp.tool()
@price(amount=2.00, currency="USD")
def process_large_dataset(dataset_url: str, ctx: Context) -> dict:
    # This could take several minutes
    return {"processing": "completed", "results": "..."}
```

**User Experience:**
```
User: "process_large_dataset('http://data.csv')"
AI: Shows payment link + "Waiting for payment... (15s elapsed)"
User: [Pays while AI waits]
AI: "Payment received — generating result..."
AI: Executes process_large_dataset() → Returns results
```

**Advantages:**
- ✅ Non-blocking payment process
- ✅ Real-time progress updates
- ✅ Automatic execution after payment
- ✅ Good for expensive operations

**Disadvantages:**
- ❌ Holds the tool execution thread
- ❌ 15-minute timeout limit
- ❌ Requires progress reporting support

### OOB Flow (Coming Soon)

**Best for:** Webhook-based integrations, asynchronous processing

Out-of-band payment processing for maximum flexibility:

```python
# Coming in future release
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.OOB)
```

Will support:
- Webhook-based payment confirmation
- Asynchronous tool execution
- Email/SMS payment links
- Subscription-based access

## Choosing the Right Flow

| Use Case | Recommended Flow | Why |
|----------|-----------------|-----|
| **General purpose tools** | TWO_STEP | Maximum compatibility, clear UX |
| **Quick micro-transactions** | ELICITATION | Seamless, immediate |
| **Expensive computations** | PROGRESS | User sees progress, non-blocking |
| **Batch/background jobs** | OOB | Asynchronous, webhook-driven |
| **Subscription access** | OOB | Recurring payments |

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

### Error Handling

All flows handle common payment errors:

```python
@mcp.tool()
@price(amount=1.00, currency="USD")
def my_tool(input: str, ctx: Context) -> str:
    try:
        return "Success result"
    except PaymentError as e:
        # PayMCP handles payment-related errors
        return {"error": "Payment failed", "message": str(e)}
```

### Multiple Providers

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

You can also use a list of instances for simpler configuration:

```python
PayMCP(
    mcp,
    providers=[
        StripeProvider(apiKey="sk_..."),
        WalleotProvider(api_key="wk_..."),
        MyCustomProvider(...)
    ]
)
# Provider keys are automatically derived from class names or .slug/.name attributes
```

## Flow Comparison

| Feature | TWO_STEP | ELICITATION | PROGRESS | OOB |
|---------|----------|-------------|----------|-----|
| **Compatibility** | ✅ Universal | ⚠️ Requires client support | ✅ Universal | 🔜 Coming soon |
| **User Steps** | 2 calls | 1 call | 1 call | Async |
| **Real-time** | ❌ | ✅ | ✅ | ❌ |
| **Background processing** | ❌ | ❌ | ✅ | ✅ |
| **Timeout handling** | ✅ | ⚠️ Client dependent | ⚠️ 15min limit | ✅ |
| **Error recovery** | ✅ | ✅ | ⚠️ Limited | ✅ |

## Next Steps

- **[Provider Setup](./providers/stripe)** - Configure your payment provider
- **[Examples](./examples/paid-image-generator)** - See flows in action
- **[API Reference](./api-reference)** - Detailed parameter documentation
