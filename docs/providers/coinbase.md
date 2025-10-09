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

new PayMCP(mcp, { providers: [new CoinbaseProvider({ api_key: "YOUR_API_KEY" })] });
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
server.registerTool(
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


## Payment Flow

### PROGRESS Flow (Recommended)

Best for crypto due to network confirmation times:

```python
PayMCP(
    mcp,
    providers={"coinbase": {"api_key": "..."}},
    payment_flow=PaymentFlow.PROGRESS
)

@mcp.tool()
@price(amount=2.50, currency="USD")
def process_data_with_crypto(data: str, ctx: Context) -> str:
    """Process data using cryptocurrency payment"""
    return f"Crypto service completed for: {data}"
```

**User Experience:**
1. User calls tool → Gets crypto payment page
2. User selects cryptocurrency → Sends payment
3. System shows "Waiting for confirmation..." with progress
4. Tool executes automatically after network confirmation

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

## Best Practices

### Pricing Strategy

```python
# Price in familiar fiat amounts
@price(amount=0.99, currency="USD")   # $0.99 → ~0.000025 BTC
@price(amount=4.99, currency="USD")   # $4.99 → ~0.000125 BTC
@price(amount=19.99, currency="USD")  # $19.99 → ~0.0005 BTC

# Users pay equivalent in any supported crypto
```

### Confirmation Settings

Configure confirmation behavior with any configuration method:

```python
# Conservative: Wait for full confirmation (slower but secure)
# Config mapping
providers = {
    "coinbase": {
        "api_key": "...",
        "confirm_on_pending": False  # Wait for network confirmation
    }
}

# Provider instance
from paymcp.providers import CoinbaseProvider
providers = [
    CoinbaseProvider(
        api_key="...",
        confirm_on_pending=False  # Wait for network confirmation
    )
]

# Aggressive: Accept on pending (faster but small risk)
# Config mapping
providers = {
    "coinbase": {
        "api_key": "...", 
        "confirm_on_pending": True   # Accept on first confirmation
    }
}

# Provider instance
providers = [
    CoinbaseProvider(
        api_key="...",
        confirm_on_pending=True  # Accept on first confirmation
    )
]
```

## Advantages

### For Crypto Users
- **Direct Payments** - Pay from any crypto wallet
- **No Intermediaries** - Direct blockchain transactions
- **Global Access** - Works anywhere with internet
- **Privacy** - No personal banking info required

### For Merchants
- **Low Fees** - 1% vs 2.9%+ for cards
- **No Chargebacks** - Crypto payments are final
- **24/7 Processing** - No business hour restrictions
- **Global Reach** - Accept payments worldwide

## Network Considerations

### Confirmation Times

- **Bitcoin**: 10-60 minutes (network dependent)
- **Ethereum**: 1-15 minutes (gas dependent)
- **Litecoin**: 2-10 minutes
- **Bitcoin Cash**: 10-60 minutes
- **USDC**: 1-15 minutes (on Ethereum)

### Transaction Fees

Users pay network fees in addition to your price:
- **Bitcoin**: $0.50-$10 (high volume dependent)
- **Ethereum**: $1-$50 (network congestion)
- **Litecoin**: $0.01-$0.10
- **USDC**: Same as Ethereum

## Error Handling

### Common Scenarios

```python
# Network congestion delays
# PayMCP waits automatically and updates progress

# Insufficient payment amount
# Clear error message with exact amount needed

# Payment timeout (24 hours)
# Automatic cancellation with user notification
```

## Production Checklist

- [ ] Switch to production API key
- [ ] Test with small real amounts
- [ ] Configure success/cancel URLs for production
- [ ] Review settlement preferences
- [ ] Understand tax implications of crypto payments

## Limitations

- **Volatility** - Crypto prices fluctuate (mitigated by instant conversion)
- **Confirmation Times** - Slower than traditional payments
- **User Experience** - Requires crypto wallet or exchange account
- **Regulatory** - Crypto regulations vary by jurisdiction

## Migration Guide

### From Traditional Payments

```python
# Before: Credit card processor
PayMCP(mcp, providers={
    "stripe": {"apiKey": "sk_..."}  # 2.9% + 30¢, chargebacks possible
})

# After: Crypto payments
PayMCP(mcp, providers={
    "coinbase": {"api_key": "..."}  # 1% fee, no chargebacks
})

# Same tools, different payment rails
```

## Support

- **Coinbase Commerce Docs**: [commerce.coinbase.com/docs](https://commerce.coinbase.com/docs)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)
- **Coinbase Support**: Available in Commerce dashboard

## Next Steps

- **[Setup Account](https://commerce.coinbase.com)** - Create Coinbase Commerce account
- **[Test Integration](../quickstart#testing-your-integration)** - Verify setup with small amounts
- **[Crypto Examples](../examples/paid-image-generator)** - See crypto payments in action


