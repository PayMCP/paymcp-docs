---
id: concepts-and-flows
title: Payment Flows
description: Understanding PayMCP architecture and choosing the right payment flow for your use case
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Payment Flows

PayMCP provides flexible payment flows to handle different interaction patterns between your MCP tools and users/agents. Choose the flow that best fits your application's needs.

## Tool Decoration

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
mcp.tool("analyze_text", {
    description: "Analyze text content and return insights",
    inputSchema: { text: z.string() }
}, async ({ text }, ctx) => {
    return { content: [{ type: "text", text: JSON.stringify({"analysis": "detailed results"}) }] };
});

// Same tool with payment requirement
mcp.tool("analyze_text", {
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

The default flow splits your tool execution into two tools: one to receive the task and return a payment link, and another one to confirm payment and execute the code. You don't need to change your function code — just write your tool as usual, and PayMCP will handle the split automatically.


```
┌─────────┐      ┌─────────┐       ┌──────────┐       ┌─────────┐
│  User   │      │   LLM   │       │MCP Server│       │ PayMCP  │
└────┬────┘      └────┬────┘       └────┬─────┘       └────┬────┘
     │                │                 │                  │
     │ Call tool      │                 │                  │
     │───────────────>│                 │                  │
     │                │ Call tool       │                  │
     │                │────────────────>│                  │
     │                │                 │ Create payment   │
     │                │                 │─────────────────>│
     │                │                 │                  │
     │                │                 │<─────────────────│
     │                │                 │ payment_url +    │
     │                │ Return URL +    │ next_step        │
     │                │<────────────────│                  │
     │                │ next_step       │                  │
     │<───────────────│                 │                  │
     │ Show payment   │                 │                  │
     │                │                 │                  │
     │ [User pays externally]           │                  │
     │                │                 │                  │
     │ Confirm payment│                 │                  │
     │───────────────>│                 │                  │
     │                │ Call confirm_*  │                  │
     │                │────────────────>│                  │
     │                │                 │ Verify payment   │
     │                │                 │─────────────────>│
     │                │                 │                  │
     │                │                 │ Execute tool     │
     │                │                 │<─────────────────│
     │                │ Return result   │                  │
     │                │<────────────────│                  │
     │ Get result     │                 │                  │
     │<───────────────│                 │                  │
```

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

installPayMCP(mcp, { providers: [StripeProvider({ apiKey: "sk_test_..." })] });

mcp.tool(
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

```
┌─────────┐      ┌─────────┐       ┌──────────┐       ┌─────────┐
│  User   │      │   LLM   │       │MCP Server│       │ PayMCP  │
└────┬────┘      └────┬────┘       └────┬─────┘       └────┬────┘
     │                │                 │                  │
     │ Call tool      │                 │                  │
     │───────────────>│                 │                  │
     │                │ Call tool       │                  │
     │                │────────────────>│                  │
     │                │                 │ Create payment   │
     │                │                 │─────────────────>│
     │                │                 │                  │
     │                │                 │ Send elicitation │
     │                │<─────────────────────────────────│
     │ Payment UI     │                 │                  │
     │<───────────────│                 │                  │
     │                │                 │                  │
     │ [User pays]    │                 │                  │
     │────────────────────────────────────────────────────>│
     │                │                 │                  │
     │                │                 │ Verify & Execute │
     │                │                 │<─────────────────│
     │                │ Return result   │                  │
     │                │<────────────────│                  │
     │ Get result     │                 │                  │
     │<───────────────│                 │                  │
```

Prompts the user for payment during tool execution and waits for completion:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.ELICITATION)

@mcp.tool()
@price(amount=0.25, currency="USD")
def analyze_text_quickly(text: str, ctx: Context) -> str:
    """Analyze text content quickly"""
    return f"Analysis: {text} processed successfully"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: {...}, 
    payment_flow: PaymentFlow.ELICITATION 
});

mcp.tool(
  "analyze_text_quickly",
  {
    description: "Analyze text content quickly",
    inputSchema: { text: z.string() },
    price: { amount: 0.25, currency: "USD" },
  },
  async ({ text }, ctx) => {
    return { content: [{ type: "text", text: `Analysis: ${text} processed successfully` }] };
  }
);
```

</TabItem>
</Tabs>

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

```
┌─────────┐      ┌─────────┐       ┌──────────┐       ┌─────────┐
│  User   │      │   LLM   │       │MCP Server│       │ PayMCP  │
└────┬────┘      └────┬────┘       └────┬─────┘       └────┬────┘
     │                │                 │                  │
     │ Call tool      │                 │                  │
     │───────────────>│                 │                  │
     │                │ Call tool       │                  │
     │                │────────────────>│                  │
     │                │                 │ Create payment   │
     │                │                 │─────────────────>│
     │                │                 │                  │
     │                │ Show payment    │                  │
     │                │<─────────────────────────────────│
     │ Payment link + │ link + progress │                  │
     │<───────────────│                 │                  │
     │                │                 │ [Polling...]     │
     │ [User pays     │                 │                  │
     │  externally]   │                 │                  │
     │                │                 │ Payment detected │
     │                │                 │<─────────────────│
     │                │                 │ Execute tool     │
     │                │ Return result   │                  │
     │                │<────────────────│                  │
     │ Get result     │                 │                  │
     │<───────────────│                 │                  │
```

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.PROGRESS)

@mcp.tool()
@price(amount=2.00, currency="USD")
def process_data_with_auto_check(data: str, ctx: Context) -> dict:
    """Process data with automatic payment checking"""
    return {"processing": "completed", "results": "..."}
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: {...}, 
    payment_flow: PaymentFlow.PROGRESS 
});

mcp.tool(
  "process_data_with_auto_check",
  {
    description: "Process data with automatic payment checking",
    inputSchema: { data: z.string() },
    price: { amount: 2.00, currency: "USD" },
  },
  async ({ data }, ctx) => {
    return { content: [{ type: "text", text: JSON.stringify({"processing": "completed", "results": "..."}) }] };
  }
);
```

</TabItem>
</Tabs>

**User Experience:**
```
User: "Please process this data: sample data"
LLM: tool call → process_data_with_auto_check("sample data")
MCP server: Returns progress indicator and payment link in a progress message
User: [Pays]
MCP server: "Payment received — generating result..."
MCP server: Executes process_data_with_auto_check() → Returns results
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
