---
id: concepts-and-flows
title: Payment Flows
description: Understanding PayMCP architecture and choosing the right payment flow for your use case
---

# Payment Flows

PayMCP provides flexible payment flows to handle different interaction patterns between your MCP tools and users/agents. Choose the flow that best fits your application's needs.

## Payment Providers

PayMCP provides an extensible provider system that abstracts payment providers behind a common interface. Providers can be supplied in multiple ways to give you maximum flexibility:

<Tabs>
<TabItem value="python" label="Python">

```python
@price(amount=1.00, currency="USD")
def process_data(input: str, ctx: Context) -> str:
    """Process input data"""
    return "Tool executed successfully"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
server.registerTool(
  "process_data",
  {
    description: "Process input data",
    inputSchema: { input: z.string() },
    price: { amount: 1.00, currency: "USD" },
  },
  async ({ input }, ctx) => {
    return { content: [{ type: "text", text: "Tool executed successfully" }] };
  }
);
```

</TabItem>
</Tabs>

### Configuration Methods
#### Recommended Provider Development

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { StripeProvider } from 'paymcp/providers';

new PayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });
```

</TabItem>
</Tabs>

This flexibility allows you to:
- Mix different configuration styles in the same setup
- Use custom providers alongside built-in ones
- Dynamically configure providers at runtime
- Share provider instances across multiple PayMCP setups

#### Custom Provider Development

Creating custom providers is straightforward. Any provider must subclass `BasePaymentProvider` and implement the required methods:

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import BasePaymentProvider

class MyProvider(BasePaymentProvider):
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        super().__init__(**kwargs)
    
    def create_payment(self, amount: float, currency: str, description: str):
        # Return (payment_id, payment_url)
        return "payment_id", f"https://myprovider.com/pay/payment_id"
    
    def get_payment_status(self, payment_id: str) -> str:
        return "paid"

PayMCP(mcp, providers=[MyProvider(api_key="...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { BasePaymentProvider } from 'paymcp/providers';

class MyProvider extends BasePaymentProvider {
    constructor(apiKey: string, options?: any) {
        super(options);
        this.apiKey = apiKey;
    }
    
    createPayment(amount: number, currency: string, description: string): [string, string] {
        // Return [payment_id, payment_url]
        return ["payment_id", "https://myprovider.com/pay/payment_id"];
    }
    
    getPaymentStatus(paymentId: string): string {
        return "paid";
    }
}

new PayMCP(mcp, { providers: [new MyProvider({ api_key: "..." })] });
```

</TabItem>
</Tabs>

You can also register custom providers for use with config mappings:

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import register_provider

register_provider("my-gateway", MyProvider)

PayMCP(mcp, providers={
    "my-gateway": {"api_key": "...", "custom_option": "value"}
})
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { registerProvider } from 'paymcp/providers';

registerProvider("my-gateway", MyProvider);

new PayMCP(mcp, {
    providers: {
        "my-gateway": { api_key: "...", custom_option: "value" }
    }
});
```

</TabItem>
</Tabs>


### Tool Decoration

The `@price` decorator adds payment requirements to your MCP tools without changing their core functionality:

<Tabs>
<TabItem value="python" label="Python">

```python
# Regular MCP tool
@mcp.tool()
def analyze_text(text: str, ctx: Context) -> dict:
    """Analyze text content and return insights"""
    return {"analysis": "detailed results"}

# Same tool with payment requirement
@mcp.tool()
@price(amount=0.25, currency="USD")
def analyze_text(text: str, ctx: Context) -> dict:
    """Analyze text content and return insights"""
    return {"analysis": "detailed results"}
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// Regular MCP tool
server.registerTool("analyze_text", {
    description: "Analyze text content and return insights",
    inputSchema: { text: z.string() }
}, async ({ text }, ctx) => {
    return { content: [{ type: "text", text: JSON.stringify({"analysis": "detailed results"}) }] };
});

// Same tool with payment requirement
server.registerTool("analyze_text", {
    description: "Analyze text content and return insights",
    inputSchema: { text: z.string() },
    price: { amount: 0.25, currency: "USD" }
}, async ({ text }, ctx) => {
    return { content: [{ type: "text", text: JSON.stringify({"analysis": "detailed results"}) }] };
});
```

</TabItem>
</Tabs>

## Payment Flows

The `payment_flow` parameter determines how users interact with your paid tools. Each flow is optimized for different scenarios.

### TWO_STEP Flow

The default flow splits your tool into two tools: one to receive the task and return a payment link, and another one to confirm payment and execute the code. You don’t need to change your function code — just write your tool as usual, and PayMCP will automatically create both tools.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])

@mcp.tool()
@price(amount=0.50, currency="USD")
def generate_data_report(data: str, ctx: Context) -> str:
    """Generate a data report from input data"""
    return f"Report generated for: {data}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { StripeProvider } from 'paymcp/providers';

new PayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });

server.registerTool(
  "generate_data_report",
  {
    description: "Generate a data report from input data",
    inputSchema: { data: z.string() },
    price: { amount: 0.50, currency: "USD" },
  },
  async ({ data }, ctx) => {
    return { content: [{ type: "text", text: `Report generated for: ${data}` }] };
  }
);
```

</TabItem>
</Tabs>

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
- Works with all MCP clients
- Clear separation of payment and execution
- User controls when to proceed
- Can handle payment failures gracefully

**Disadvantages:**
- Doubles the number of tools in your MCP server, which may confuse LLMs. It’s generally not recommended to have more than 3–4 tools in one MCP server.

### ELICITATION Flow


Prompts the user for payment during tool execution and waits for completion:

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.ELICITATION)

@mcp.tool()
@price(amount=0.25, currency="USD")
def analyze_text_quickly(text: str, ctx: Context) -> str:
    """Analyze text content quickly"""
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
- Single interaction
- Seamless user experience
- Immediate execution after payment

**Disadvantages:**
- Requires MCP client support for elicitation. See which clients support it here: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)

### PROGRESS Flow

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.PROGRESS)

@mcp.tool()
@price(amount=2.00, currency="USD")
def process_large_dataset(dataset_url: str, ctx: Context) -> dict:
    """Process a large dataset from URL"""
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
- Non-blocking payment process
- Real-time progress updates
- Automatic execution after payment

**Disadvantages:**
- Holds the tool execution thread
- Timeout duration depends on the client
- Requires progress reporting support that can display progress messages (not just percentages)


## Next Steps

- **[Provider Setup](./providers/stripe)** - Configure your payment provider
- **[Examples](./examples/paid-image-generator)** - See flows in action
- **[API Reference](./api-reference)** - Detailed parameter documentation
