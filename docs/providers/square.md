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


## Testing

### Sandbox Environment

Square provides sandbox testing with all configuration methods:

```python
# Config mapping
providers = {
    "square": {
        "access_token": "YOUR_SANDBOX_ACCESS_TOKEN",
        "location_id": "YOUR_SANDBOX_LOCATION_ID",
        "sandbox": True,
        "redirect_url": "http://localhost:3000/success"
    }
}

# Provider instance
from paymcp.providers import SquareProvider
providers = [
    SquareProvider(
        access_token="YOUR_SANDBOX_ACCESS_TOKEN",
        location_id="YOUR_SANDBOX_LOCATION_ID",
        sandbox=True,
        redirect_url="http://localhost:3000/success"
    )
]
```

### Test Cards

Square provides test cards for different scenarios:

| Card Number | Result |
|-------------|---------|
| `4111 1111 1111 1111` | Visa - Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 0341` | Charge disputed |

## Best Practices

### Pricing Strategy

```python
# Square users expect clear, simple pricing
@price(amount=0.99, currency="USD")   # Small purchase
@price(amount=9.99, currency="USD")   # Standard price point
@price(amount=29.99, currency="USD")  # Premium feature
```

### Error Handling

```python
# Square provides detailed error codes
# PayMCP handles common errors automatically:
# - Card declined
# - Insufficient funds
# - Invalid card details
# - Network timeouts
```

## Advantages

- **Transparent Fees** - No hidden costs or markup
- **Fast Settlement** - Next business day deposits
- **Excellent UX** - Clean, modern payment forms
- **Developer Tools** - Great sandbox and documentation
- **Mobile Optimized** - Responsive payment experience

## Production Checklist

- [ ] Switch to production credentials (`sandbox: False`)
- [ ] Update redirect URLs to production domains
- [ ] Test with small real amounts
- [ ] Verify location settings in Square Dashboard
- [ ] Review transaction limits

## Next Steps

- **[Square Documentation](https://developer.squareup.com/)** - Official docs
- **[Test Integration](../quickstart#testing-your-integration)** - Verify setup
- **[Payment Flows](../concepts-and-flows#two_step-flow)** - Choose optimal flow
