---
id: coinbase
title: "Coinbase Provider"
description: Accept cryptocurrency payments using Coinbase Commerce
---

# Coinbase Provider

Coinbase Commerce enables cryptocurrency payments with support for Bitcoin, Ethereum, Bitcoin Cash, Litecoin, and USD Coin. Ideal for businesses wanting to accept crypto with minimal complexity.

## Features

- **Major Cryptocurrencies** - Bitcoin, Ethereum, Bitcoin Cash, Litecoin, USDC
- **No Volatility Risk** - Optional instant conversion to USD
- **Low Fees** - 1% transaction fee
- **Global Access** - Accept payments from anywhere
- **Self-Custody** - You control your crypto keys
- **Simple Integration** - Easy API with comprehensive docs

## Quick Setup

### 1. Create Coinbase Commerce Account

1. Sign up at [commerce.coinbase.com](https://commerce.coinbase.com)
2. Complete account verification
3. Generate an **API Key** in Settings
4. Configure withdrawal settings

### 2. Configuration

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import CoinbaseProvider

PayMCP(mcp, providers=[CoinbaseProvider(api_key="YOUR_API_KEY")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { CoinbaseProvider } from 'paymcp/providers';

installPayMCP(mcp, { providers: [CoinbaseProvider({ api_key: "YOUR_API_KEY" })] });
```

</TabItem>
</Tabs>

### 3. Test Your Integration

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=1.00, currency="USD")
def test_crypto_payment(item: str, ctx: Context) -> str:
    """Test cryptocurrency payment"""
    return f"Crypto payment successful for: {item}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
mcp.tool(
  "test_crypto_payment",
  {
    description: "Test cryptocurrency payment",
    inputSchema: { item: z.string() },
    price: { amount: 1.00, currency: "USD" },
  },
  async ({ item }, ctx) => {
    return { content: [{ type: "text", text: `Crypto payment successful for: ${item}` }] };
  }
);
```

</TabItem>
</Tabs>

## Configuration Options

```python
providers = {
    "coinbase": {
        "api_key": "YOUR_API_KEY",            # Required
        "success_url": "https://yourapp.com/success",  # Optional
        "cancel_url": "https://yourapp.com/cancel",    # Optional
        "confirm_on_pending": False,          # Wait for network confirmation
    }
}
```


## Testing

### Test Environment

Coinbase Commerce provides sandbox for testing:

```python
# Test with small amounts on live network
@price(amount=0.01, currency="USD")  # $0.01 test payment
def test_crypto(ctx: Context) -> str:
    return "Test payment successful"
```

### Test Cryptocurrencies

Use testnets for development:
- **Bitcoin Testnet** - Test BTC transactions
- **Ethereum Goerli** - Test ETH/USDC transactions
- **Faucets** - Get test crypto for development

## Support

- **Coinbase Commerce Docs**: [commerce.coinbase.com/docs](https://commerce.coinbase.com/docs)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)
- **Coinbase Support**: Available in Commerce dashboard



