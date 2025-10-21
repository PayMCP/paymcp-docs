---
id: paypal
title: "PayPal Provider"
description: Accept payments via PayPal balance, credit cards, and bank transfers worldwide
---

# PayPal Provider

PayPal enables payments from PayPal balance, credit cards, and bank transfers. With 400+ million active users worldwide, PayPal offers broad payment method coverage and trusted checkout experience.

## Features

- **400M+ Users** - Access PayPal's massive user base
- **Multiple Payment Methods** - PayPal balance, cards, bank transfers
- **Global Coverage** - Available in 200+ countries

## Quick Setup

### 1. Create PayPal App

1. Go to [PayPal Developer Console](https://developer.paypal.com)
2. Create a new app for your integration
3. Note your **Client ID** and **Client Secret**
4. Configure return URLs for your domain

### 2. Configuration

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import PayPalProvider

PayMCP(mcp, providers=[
    PayPalProvider(
        client_id="YOUR_CLIENT_ID",
        client_secret="YOUR_CLIENT_SECRET",
        sandbox=True
    )
])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { PayPalProvider } from 'paymcp/providers';

installPayMCP(mcp, { 
    providers: [
        PayPalProvider({
            client_id: "YOUR_CLIENT_ID",
            client_secret: "YOUR_CLIENT_SECRET",
            sandbox: true
        })
    ]
});
```

</TabItem>
</Tabs>

### 3. Test Your Integration

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=1.00, currency="USD")
def test_paypal_payment(message: str, ctx: Context) -> str:
    """Test PayPal payment integration"""
    return f"PayPal payment successful! Message: {message}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
mcp.tool(
  "test_paypal_payment",
  {
    description: "Test PayPal payment integration",
    inputSchema: { message: z.string() },
    price: { amount: 1.00, currency: "USD" },
  },
  async ({ message }, ctx) => {
    return { content: [{ type: "text", text: `PayPal payment successful! Message: ${message}` }] };
  }
);
```

</TabItem>
</Tabs>

## Configuration Options

### Required Parameters

```python
providers = {
    "paypal": {
        "client_id": "YOUR_CLIENT_ID",      # From PayPal Developer Console
        "client_secret": "YOUR_CLIENT_SECRET", # From PayPal Developer Console
        "sandbox": True,                     # True for testing, False for production
    }
}
```

### Optional Parameters

```python
providers = {
    "paypal": {
        "client_id": "YOUR_CLIENT_ID",
        "client_secret": "YOUR_CLIENT_SECRET",
        "sandbox": False,  # Production mode
        "success_url": "https://yourapp.com/success",
        "cancel_url": "https://yourapp.com/cancel",
    }
}
```



**User Experience:**
1. User calls tool → Gets PayPal checkout URL
2. User clicks "Pay with PayPal" → PayPal login/payment
3. User returns → Calls confirmation tool
4. Tool executes after payment verification

## Support

- **PayPal Developer Docs**: [developer.paypal.com](https://developer.paypal.com)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)
- **PayPal Developer Support**: Available in Developer Console
