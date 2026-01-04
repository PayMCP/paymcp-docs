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
- **Promocodes** – Define promocodes to offer discounts or fully cover tool costs, allowing end users to access features for free or at reduced prices

## Quick Setup

### 1. Get Your API Keys

1. Sign up at [walleot.com](https://walleot.com)
2. Create a Merchant Account
3. Navigate to **API Keys**
4. Click **Create API Key** to generate a new key

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
import { installPayMCP } from 'paymcp';
import { WalleotProvider } from 'paymcp/providers';

installPayMCP(mcp, { providers: [new WalleotProvider({ apiKey: "sk_test_..." })] });
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
import { z } from 'zod';

mcp.registerTool(
  "test_walleot_payment",
  {
    description: "Test Walleot payment integration",
    inputSchema: { message: z.string() },
    _meta: { price: { amount: 0.50, currency: "USD" } },
  },
  async ({ message }, extra) => {
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
- **Developer Discord**: [Join community](https://discord.gg/walleot)
