---
id: square
title: "Square Provider"
description: Accept payments using Square's payment platform with support for cards and digital wallets
---

# Square Provider

Square provides payment processing with support for credit cards, digital wallets, and in-person payments. Known for transparent pricing and excellent developer tools.

## Features

- **Transparent Pricing** - No hidden fees, simple rate structure
- **In-Person Payments** - Supports both online and offline transactions
- **Digital Wallets** - Apple Pay, Google Pay, and more
- **Global Coverage** - Available in US, Canada, UK, Australia, and more
- **Developer-Friendly** - Excellent sandbox and testing tools
- **PCI Compliance** - Built-in security and compliance

## Quick Setup

### 1. Get Square Credentials

1. Sign up at [squareup.com](https://squareup.com)
2. Go to **Developer Dashboard**
3. Create a new application
4. Copy your **Access Token** and **Location ID**

### 2. Configuration

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import SquareProvider

PayMCP(mcp, providers=[
    SquareProvider(
        access_token="YOUR_ACCESS_TOKEN",
        location_id="YOUR_LOCATION_ID",
        sandbox=True
    )
])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { SquareProvider } from 'paymcp/providers';

new PayMCP(mcp, { 
    providers: [
        new SquareProvider({
            access_token: "YOUR_ACCESS_TOKEN",
            location_id: "YOUR_LOCATION_ID",
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
@price(amount=1.50, currency="USD")
def test_square_payment(item: str, ctx: Context) -> str:
    """Test Square payment integration"""
    return f"Square payment successful for: {item}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
server.registerTool(
  "test_square_payment",
  {
    description: "Test Square payment integration",
    inputSchema: { item: z.string() },
    price: { amount: 1.50, currency: "USD" },
  },
  async ({ item }, ctx) => {
    return { content: [{ type: "text", text: `Square payment successful for: ${item}` }] };
  }
);
```

</TabItem>
</Tabs>

## Configuration Options

```python
providers = {
    "square": {
        "access_token": "YOUR_ACCESS_TOKEN",  # Required
        "location_id": "YOUR_LOCATION_ID",    # Required
        "sandbox": True,                      # True for testing
        "redirect_url": "https://yourapp.com/success",  # Optional
        "api_version": "2025-03-19"          # Optional, defaults to latest
    }
}
```

## Next Steps

- **[Square Documentation](https://developer.squareup.com/)** - Official docs
- **[Test Integration](../quickstart#testing-your-integration)** - Verify setup
- **[Payment Flows](../concepts-and-flows#two_step-flow)** - Choose optimal flow
