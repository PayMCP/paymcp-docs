---
id: walleot
title: "Walleot Provider"
description: Accept payments with pre-purchased credits and auto payments using Walleot
---

# Walleot Provider

Walleot enables seamless payments with pre-purchased credits and automatic payment processing.

## Features

- **Pre-purchased Credits** - Users buy credits in advance for frictionless payments
- **Auto Payments** - Automatic payment processing for approved amounts
- **Instant Settlement** - Receive payments in seconds, not days
- **Global Access** - No geographic restrictions or bank requirements
- **Low Fees** - Minimal transaction costs
- **Developer-Friendly** - Simple API with comprehensive testing tools

## Quick Setup

### 1. Get Your API Keys

1. Sign up at [walleot.com](https://walleot.com)
2. Complete KYC verification (required for settlement)
3. Navigate to **Developers** → **API Keys**
4. Copy your **API Key** (starts with `sk_test_` for testing)

### 2. Configuration

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import WalleotProvider

PayMCP(mcp, providers=[WalleotProvider(api_key="sk_test_...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { WalleotProvider } from 'paymcp/providers';

installPayMCP(mcp, { providers: [WalleotProvider({ api_key: "sk_test_..." })] });
```

</TabItem>
</Tabs>

### 3. Test Your Integration

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
def test_walleot_payment(message: str, ctx: Context) -> str:
    """Test Walleot payment integration"""
    return f"Walleot payment successful! Message: {message}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
mcp.tool(
  "test_walleot_payment",
  {
    description: "Test Walleot payment integration",
    inputSchema: { message: z.string() },
    price: { amount: 0.50, currency: "USD" },
  },
  async ({ message }, ctx) => {
    return { content: [{ type: "text", text: `Walleot payment successful! Message: ${message}` }] };
  }
);
```

</TabItem>
</Tabs>

Test with small amounts first.

## Support

- **Walleot Documentation**: [docs.walleot.com](https://docs.walleot.com)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)
- **Walleot Support**: Available 24/7 in your dashboard
- **Developer Discord**: [Join our community](https://discord.gg/walleot)
