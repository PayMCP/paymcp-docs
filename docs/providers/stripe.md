---
id: stripe
title: "Stripe Provider"
description: Complete guide to integrating Stripe payments with PayMCP
---

# Stripe Provider

Stripe is one of the most popular payment processors globally, supporting credit cards, ACH transfers, and international payments in 40+ countries.

## Features

- **Global Coverage** - Accept payments in 135+ currencies
- **Payment Methods** - Cards, bank transfers, digital wallets


## Quick Setup

### 1. Get Your API Keys

1. Sign up at [stripe.com](https://stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Secret Key** (starts with `sk_test_` for testing)

### 2. Configuration

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import StripeProvider

PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { installPayMCP } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

installPayMCP(mcp, { providers: [new StripeProvider({ apiKey: "sk_test_..." })] });
```

</TabItem>
</Tabs>



### 3. Test Your Integration

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
def test_stripe_payment(message: str, ctx: Context) -> str:
    """Test Stripe payment integration"""
    return f"Stripe payment successful: {message}"
```

Test with Stripe's test card: `4242 4242 4242 4242`


## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)
- **Stripe Support**: Available in your Stripe Dashboard
