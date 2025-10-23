---
id: concepts-and-flows
title: Payment Flows
description: Understanding PayMCP architecture and choosing the right payment flow for your use case
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Payment Flows

PayMCP provides flexible payment flows to handle different interaction patterns between your MCP tools and users/agents. 

The `payment_flow` parameter determines how users interact with your paid tools. Each flow is optimized for different scenarios.

Available flows include `TWO_STEP`, `ELICITATION`, `PROGRESS`, and `DYNAMIC_TOOLS`.

### TWO_STEP Flow

The default flow splits your tool execution into two tools: one to receive the task and return a payment link, and another one to confirm payment and execute the code. You don't need to change your function code — just write your tool as usual, and PayMCP will handle the split automatically.

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])

@mcp.tool()
@price(amount=0.50, currency="USD")
def generate_image(prompt: str, ctx: Context) -> str:
    """Generate an image based on user prompt"""
    return f"Image generated for: {prompt}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { StripeProvider } from 'paymcp/providers';

installPayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });

mcp.tool(
  "generate_image",
  {
    description: "Generate an image based on user prompt",
    inputSchema: { prompt: z.string() },
    price: { amount: 0.50, currency: "USD" },
  },
  async ({ prompt }, ctx) => {
    return { content: [{ type: "text", text: `Image generated for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>

Under the hood, PayMCP will replace your `generate_image` tool so that it first returns a payment link, and will automatically add an additional tool `confirm_generate_image` that actually runs your original code after the payment is completed.


![TWO_STEP Flow Diagram](/diagrams/TWO_STEP.drawio.svg)

**User Experience:**
```
User: "Draw a dog"
LLM: tool call → generate_image("a dog")
MCP server: Returns payment link
User: [Pays] → "I paid"
LLM: tool call → confirm_generate_image(payment_id)
MCP server: Executes original generate_image() → Returns actual result
```

**Advantages:**
- Works with all MCP clients
- Clear separation of payment and execution
- User controls when to proceed
- Can handle payment failures gracefully

**Disadvantages:**
- Doubles the number of tools in your MCP server, which may confuse LLMs. It’s generally not recommended to have more than 3–4 tools in one MCP server.

### ELICITATION Flow

The elicitation flow temporarily pauses your tool execution, dynamically sends the user a payment link, and waits for payment confirmation before continuing. 


<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.ELICITATION)

@mcp.tool()
@price(amount=0.25, currency="USD")
def generate_image(prompt: str, ctx: Context) -> str:
    """Generate an image based on user prompt"""
    return f"Image generated for: {prompt}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: {...}, 
    payment_flow: PaymentFlow.ELICITATION 
});

mcp.tool(
  "generate_image",
  {
    description: "Generate an image based on user prompt",
    inputSchema: { prompt: z.string() },
    price: { amount: 0.25, currency: "USD" },
  },
  async ({ prompt }, ctx) => {
    return { content: [{ type: "text", text: `Image generated for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>



![ELICITATION Flow Diagram](/diagrams/ELICITATION.drawio.svg)

Under the hood, PayMCP adds logic to your `generate_image` tool to generate a payment link and wait until the payment is confirmed before resuming execution.


**User Experience:**
```
User: "Draw a dog"
LLM: tool call → generate_image("a dog")
MCP server: Returns payment link
User: [Pays] -> Confirm payment
MCP server: Executes generate_image() → Returns result
```

**Advantages:**
- Single interaction
- Seamless user experience
- Immediate execution after payment

**Disadvantages:**
- Requires MCP client support for elicitation. See which clients support it here: [https://modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)


### PROGRESS Flow

The progress flow temporarily pauses your tool execution, shows a payment link with progress updates, and automatically resumes execution once the payment is completed.



<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers={...}, payment_flow=PaymentFlow.PROGRESS)

@mcp.tool()
@price(amount=2.00, currency="USD")
def generate_image(prompt: str, ctx: Context) -> dict:
    """Generate an image"""
    return {"image": f"Generated image for: {prompt}"}
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, { 
    providers: {...}, 
    payment_flow: PaymentFlow.PROGRESS 
});

mcp.tool(
  "generate_image",
  {
    description: "Generate an image",
    inputSchema: { prompt: z.string() },
    price: { amount: 2.00, currency: "USD" },
  },
  async ({ prompt }, ctx) => {
    return { content: [{ type: "text", text: JSON.stringify({ image: `Generated image for: ${prompt}` }) }] };
  }
);
```

</TabItem>
</Tabs>


![PROGRESS Flow Diagram](/diagrams/PROGRESS.drawio.svg)

Under the hood, PayMCP adds logic to your `generate_image` tool to generate a payment link, periodically poll the payment provider to check if the payment has been completed, and automatically continue execution once the payment is confirmed.

**User Experience:**
```
User: "Generate an image of a dog"
LLM: tool call → generate_image("a dog")
MCP server: Returns progress indicator and payment link in a progress message
User: [Pays]
MCP server: "Payment received — generating image..."
MCP server: Executes generate_image() → Returns image URL 
```

**Advantages:**
- Non-blocking payment process
- Real-time progress updates
- Automatic execution after payment

**Disadvantages:**
- Holds the tool execution thread
- Timeout duration depends on the client
- Requires progress reporting support that can display progress messages (not just percentages)



### DYNAMIC_TOOLS Flow

The dynamic-tools flow changes the set of tools that are visible at specific points in the interaction. PayMCP temporarily exposes only the next valid action (e.g., temporarily expose `confirm_payment`, hide `generate_image`, and send a `listChanged` notification) so the LLM is strongly guided to proceed correctly. 

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], payment_flow=PaymentFlow.DYNAMIC_TOOLS)

@mcp.tool()
@price(amount=0.75, currency="USD")
def generate_image(prompt: str, ctx: Context) -> str:
    """Generate an image based on user prompt"""
    return f"Image generated for: {prompt}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { StripeProvider } from 'paymcp/providers';

installPayMCP(mcp, {
  providers: [new StripeProvider({ apiKey: "sk_test_..." })],
  payment_flow: PaymentFlow.DYNAMIC_TOOLS
});

mcp.tool(
  "generate_image",
  {
    description: "Generate an image based on user prompt",
    inputSchema: { prompt: z.string() },
    price: { amount: 0.75, currency: "USD" },
  },
  async ({ prompt }, ctx) => {
    return { content: [{ type: "text", text: `Image generated for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>

![DYNAMIC_TOOLS Flow Diagram](/diagrams/DYNAMIC_TOOLS.drawio.svg)

Under the hood, PayMCP dynamically adjusts which tools are visible. After the first call to your tool returns a payment link, PayMCP hides `generate_image`, exposes the confirmation tool `confirm_payment`, and sends a `listChanged` notification. Once payment is confirmed, `confirm_payment` executes your original function.

**User Experience:**
```
User: "Draw a dog"
LLM: tool call → generate_image("a dog")
MCP server: Returns payment link, hides `generate_image`, exposes `confirm_payment`, and sends `listChanged` notification
User: [Pays]
LLM: tool call → confirm_generate_image(payment_id)
MCP server: Executes original generate_image() → Returns result, hides `confirm_payment`, exposes `generate_image` and sends `listChanged` notification
```

**Advantages:**
- Strong steering by constraining the next valid action.
- Works without elicitation/progress support in the client.
- Clear, stepwise flow.

**Disadvantages:**
- Experimental; depends on how clients handle dynamic tool lists.
- Temporarily increases the number of visible tools.
- Requires client support for `listChanged` notifications.
- Caching and "flicker" (tools appear/disappear) can confuse users and models.


## Next Steps

- **[Provider Setup](./providers/stripe)** - Configure your payment provider
- **[Examples](./examples/paid-image-generator)** - See flows in action
- **[API Reference](./api-reference)** - Detailed parameter documentation
