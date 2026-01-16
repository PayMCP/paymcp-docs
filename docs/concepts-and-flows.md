---
id: concepts-and-flows
title: Coordination Modes
description: Understanding PayMCP architecture and choosing the right coordination mode for your use case
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Coordination Modes

PayMCP provides flexible coordination modes to handle different interaction patterns between your MCP tools and MCP clients. 

The `mode` parameter determines how clients interact with your paid tools. Each mode is optimized for different scenarios.


Available modes include `AUTO`, `RESUBMIT`, `ELICITATION`, `TWO_STEP`, `X402`, `PROGRESS`, and `DYNAMIC_TOOLS`.

### Mode.AUTO (Default)

AUTO detects client capabilities and chooses the best flow automatically. If an X402 provider is configured and the client supports x402, it uses `X402`. Otherwise it uses `ELICITATION` when supported, and falls back to `RESUBMIT`.

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

If you configure both X402 and a traditional provider, AUTO will pick X402 when the client supports it:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(
    mcp,
    providers=[
        X402Provider(payTo=[{"address": "0xYourAddress"}]),
        StripeProvider(apiKey="sk_test_...")
    ],
    mode=Mode.AUTO
)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
installPayMCP(mcp, {
  providers: [
    new StripeProvider({ apiKey: "sk_test_..." }),
    new X402Provider({payTo:[{"address": "0xYourAddress"}]})
  ],
  mode: Mode.AUTO
});
```

</TabItem>
</Tabs>


### Mode.TWO_STEP 

The two-step mode splits your tool execution into two tools: one to receive the task and return a payment link, and another one to confirm payment and execute the code. You don't need to change your function code — just write your tool as usual, and PayMCP will handle the split automatically.

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

mcp.registerTool(
  "generate_image",
  {
    description: "Generate an image based on user prompt",
    inputSchema: { prompt: z.string() },
    _meta: { price: { amount: 0.50, currency: "USD" } },
  },
  async ({ prompt }, extra) => {
    return { content: [{ type: "text", text: `Image generated for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>

Under the hood, PayMCP will replace your `generate_image` tool so that it first returns a payment link, and will automatically add an additional tool `confirm_generate_image` that actually runs your original code after the payment is completed.


![TWO_STEP Diagram](/diagrams/TWO_STEP.drawio.svg)

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

### Mode.RESUBMIT

The RESUBMIT mode handles payment by requiring the client to call the same tool twice: once to trigger payment, and again to confirm it using a payment_id. This allows the tool to remain logically the same from the developer’s perspective, with minimal changes.


<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], mode=Mode.RESUBMIT)

@mcp.tool()
@price(amount=1.25, currency="USD")
def generate_contract(prompt: str, ctx: Context) -> str:
    return f"Contract generated for: {prompt}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { StripeProvider } from 'paymcp/providers';

installPayMCP(mcp, {
  providers: [new StripeProvider({ apiKey: "sk_test_..." })],
  mode: Mode.RESUBMIT
});

mcp.registerTool(
  "generate_contract",
  {
    description: "Generate a contract after payment",
    inputSchema: { prompt: z.string(), payment_id: z.string().optional() },
    _meta: { price: { amount: 1.25, currency: "USD" } },
  },
  async ({ prompt}, extra) => {
    return { content: [{ type: "text", text: `Contract generated for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>

Under the hood, PayMCP adds an optional `payment_id` parameter to your tool and handles the 402 Payment Required response automatically. On the first call (without payment_id), it returns a payment link and instructs the client to retry with the provided `payment_id`. On the second call (with payment_id), PayMCP verifies payment and executes your original function.

> **Client behavior requirements:** Clients should either handle the **402** by itself (display the payment URL, wait for confirmation, then retry with the `payment_id`) **or** forward the **full 402 response body** (including the payment URL and `payment_id`) to the LLM. Forwarding a 402 without its body prevents the user from seeing the payment link and stalls the flow.


![RESUBMIT Diagram](/diagrams/RESUBMIT.drawio.svg)

**User Experience:**
```
User: "Draw a dog"
LLM: tool call → generate_image("a dog")
MCP server: Returns 402 error with payment link and payment ID
User: [Pays] → "I paid"
LLM: tool call → generate_image("a dog", payment_id)
MCP server: Executes original code → Returns actual result
```

**Advantages:**
- Minimal integration changes — keep your tool as a single function
- Tool signature remains mostly unchanged (only adds optional `payment_id`)
- Natural for clients or models that support structured error handling
- Compatible with most MCP clients that support retrying on 402 errors

**Disadvantages:**
- Requires client retry logic to handle 402 errors properly
- Arguments must be repeated by the caller — risk of **argument drift**
- LLMs or clients may **retry prematurely** before payment is complete
- If client hides error details, users may miss the **payment link**
- No server-side state — resubmitting with mismatched or reused `payment_id` will fail


### Mode.X402

X402 is a specialization of `Mode.RESUBMIT` for on-chain payments using the [X402 protocol](https://www.x402.org).
Instead of returning a payment URL + `payment_id`, PayMCP returns an X402 **payment request** payload.
The client obtains a payer signature (either automatically via an agent-controlled wallet, or by prompting a user to sign in their existing crypto wallet) and then retries the same tool call with a **payment signature**.
PayMCP verifies the signature and settles on-chain via a facilitator before returning the tool result.


<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import X402Provider

paymcp = PayMCP(mcp, providers=[
    X402Provider(pay_to={"address":"0xAddress","network":"eip155:84532"},facilitator={"url":"https://www.x402.org/facilitator"}) #example for Base-sepolia (test network) with a custom facilitator
  ],
  mode=Mode.X402)

@mcp.tool()
@price(amount=1.25, currency="USD")
def generate_contract(prompt: str, ctx: Context) -> str:
    return f"Contract generated for: {prompt}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { X402Provider } from 'paymcp/providers';

const paymcp = installPayMCP(mcp, {
  providers: [
    new X402Provider({ "payTo":{"address":"0xAddress","network":"eip155:84532"},"facilitator":{"url":"https://www.x402.org/facilitator"}}) //example for Base-sepolia (test network) with a custom facilitator
  ],
  mode: Mode.X402
});

mcp.registerTool(
  "generate_contract",
  {
    description: "Generate a contract after payment",
    inputSchema: { prompt: z.string(), payment_id: z.string().optional() },
    _meta: { price: { amount: 1.25, currency: "USD" } },
  },
  async ({ prompt}, extra) => {
    return { content: [{ type: "text", text: `Contract generated for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>

By default PayMCP uses `https://facilitator.paymcp.info` with no API keys. To change facilitators, set `facilitator.url`. The Coinbase CDP facilitator requires `apiKeyId` and `apiKeySecret`.


**Key differences from RESUBMIT:**
- Payment data is returned as an **X402 payment request** payload (not a URL).
- The client retries with a **payment signature** provided either in headers (`payment-signature` or `x-payment`) or in `_meta["x402/payment"]` (PayMCP accepts both).
- This flow supports **automatic agent-to-agent payments** as well as **user-approved payments** (the client can ask the user to sign the request).
- Requires the X402 provider.
- Only use with clients that support x402 (see https://www.x402.org).


![X402 Diagram](/diagrams/X402.drawio.svg)

**User Experience:**
```
User: "Draw a dog"
LLM: tool call → generate_image("a dog")
MCP Client: tool call → generate_image("a dog")
MCP server: Returns Payment Required (X402 payment request)
MCP Client: tool call → generate_image("a dog") + payment signature (header `payment-signature` / `x-payment` OR `_meta["x402/payment"]`)
MCP server: Verifies signature, settles on-chain via facilitator → Returns actual result
```

**Transport (JSON-RPC vs HTTP 402):**
- By default, the Payment Required information is included in the **JSON-RPC response body** so any MCP client can surface it.
- If your client can read HTTP headers / status codes, you can enable a true **HTTP 402** response by installing the X402 middleware.

<Tabs>
<TabItem value="python" label="Python">
```py
app.add_middleware(paymcp.get_x402_middleware()) #FastAPI example
```
</TabItem>
<TabItem value="typescript" label="TypeScript">
```ts
app.use('/mcp', paymcp.getX402Middleware()) #Express example
```
</TabItem>
</Tabs>



**Advantages:**
- On-chain settlement with signed payment payloads
- Single tool name without extra parameters

**Disadvantages:**
- Very limited client support
- Requires facilitator access and on-chain gas for the payer
- Unlike `RESUBMIT` (where the full 402 response body can be forwarded to the LLM), X402 requires the **MCP client** to understand the payment request and perform signing / retry — the LLM alone will not know how to handle an X402 payment request payload.

### Mode.ELICITATION

The elicitation mode temporarily pauses your tool execution, dynamically sends the user a payment link, and waits for payment confirmation before continuing. 


<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers={...}, mode=Mode.ELICITATION)

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
    mode: Mode.ELICITATION 
});

mcp.registerTool(
  "generate_image",
  {
    description: "Generate an image based on user prompt",
    inputSchema: { prompt: z.string() },
    _meta: { price: { amount: 0.25, currency: "USD" } },
  },
  async ({ prompt }, extra) => {
    return { content: [{ type: "text", text: `Image generated for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>



![ELICITATION Mode Diagram](/diagrams/ELICITATION.drawio.svg)

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


### Mode.PROGRESS

The progress mode temporarily pauses your tool execution, shows a payment link with progress updates, and automatically resumes execution once the payment is completed.



<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers={...}, mode=Mode.PROGRESS)

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
    mode: Mode.PROGRESS 
});

mcp.registerTool(
  "generate_image",
  {
    description: "Generate an image",
    inputSchema: { prompt: z.string() },
    _meta: { price: { amount: 2.00, currency: "USD" } },
  },
  async ({ prompt }, extra) => {
    return { content: [{ type: "text", text: JSON.stringify({ image: `Generated image for: ${prompt}` }) }] };
  }
);
```

</TabItem>
</Tabs>


![PROGRESS Diagram](/diagrams/PROGRESS.drawio.svg)

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

### Mode.DYNAMIC_TOOLS 

The dynamic-tools mode changes the set of tools that are visible at specific points in the interaction. PayMCP temporarily exposes only the next valid action (e.g., temporarily expose `confirm_payment`, hide `generate_image`, and send a `listChanged` notification) so the LLM is strongly guided to proceed correctly. 

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")], mode=Mode.DYNAMIC_TOOLS)

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
  mode: Mode.DYNAMIC_TOOLS
});

mcp.registerTool(
  "generate_image",
  {
    description: "Generate an image based on user prompt",
    inputSchema: { prompt: z.string() },
    _meta: { price: { amount: 0.75, currency: "USD" } },
  },
  async ({ prompt }, extra) => {
    return { content: [{ type: "text", text: `Image generated for: ${prompt}` }] };
  }
);
```

</TabItem>
</Tabs>

![DYNAMIC_TOOLS Diagram](/diagrams/DYNAMIC_TOOLS.drawio.svg)

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
- **[Examples](./examples/paid-image-generator)** - See PayMCP in action
- **[API Reference](./api-reference)** - Detailed parameter documentation
