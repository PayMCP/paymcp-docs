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
4. Copy your **API Key** (starts with `wk_test_` for testing)

### 2. Configuration

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from paymcp.providers import WalleotProvider

PayMCP(mcp, providers=[WalleotProvider(api_key="wk_test_...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { WalleotProvider } from 'paymcp/providers';

new PayMCP(mcp, { providers: [new WalleotProvider({ api_key: "wk_test_..." })] });
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
server.registerTool(
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


## Payment Flows

### Recommended: ELICITATION Flow

Best for Walleot due to instant credit processing:

<Tabs>
<TabItem value="python" label="Python">

```python
PayMCP(mcp, providers=[WalleotProvider(api_key="wk_test_...")], payment_flow=PaymentFlow.ELICITATION)

@mcp.tool()
@price(amount=0.25, currency="USD")
def process_data_instantly(data: str, ctx: Context) -> str:
    """Process data with instant Walleot payment"""
    return f"Processed: {data}"
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
new PayMCP(mcp, { 
    providers: [new WalleotProvider({ api_key: "wk_test_..." })],
    payment_flow: PaymentFlow.ELICITATION 
});

server.registerTool(
  "process_data_instantly",
  {
    description: "Process data with instant Walleot payment",
    inputSchema: { data: z.string() },
    price: { amount: 0.25, currency: "USD" },
  },
  async ({ data }, ctx) => {
    return { content: [{ type: "text", text: `Processed: ${data}` }] };
  }
);
```

</TabItem>
</Tabs>

### Alternative: TWO_STEP Flow

For compatibility with all MCP clients:

```python
PayMCP(
    mcp,
    providers={"walleot": {"apiKey": "wk_test_..."}},
    payment_flow=PaymentFlow.TWO_STEP
)

# User gets payment link, pays, then calls confirmation
```

## Advanced Configuration

### Settlement Currency

Configure automatic conversion:

```python
# Walleot handles conversion automatically based on your account settings
# Set your preferred settlement currency in your Walleot dashboard
```

### Payment Processing

Walleot automatically handles payment processing for optimal speed and cost.

## Testing

### Test Environment

Walleot provides a complete test environment with all configuration methods:

```python
# Config mapping
providers = {
    "walleot": {
        "apiKey": "wk_test_...",  # Test key for sandbox
    }
}

# Provider instance
from paymcp.providers import WalleotProvider
providers = [
    WalleotProvider(api_key="wk_test_...")
]
```

### Test Scenarios

```python
# Small amount - tests Lightning Network
@price(amount=0.01, currency="USD")
def lightning_test(ctx: Context) -> str:
    return "Lightning payment successful"

# Medium amount - tests stablecoin payments
@price(amount=1.00, currency="USDC")
def stablecoin_test(ctx: Context) -> str:
    return "Stablecoin payment successful"

# Larger amount - tests on-chain Bitcoin
@price(amount=25.00, currency="USD")
def onchain_test(ctx: Context) -> str:
    return "On-chain payment successful"
```

### Test Environment

Use Walleot's test environment to simulate payments with test credits.

## Error Handling


### Timeout Handling

```python
# Crypto payments can have variable confirmation times
# Walleot handles this automatically:

@mcp.tool()
@price(amount=1.00, currency="USD")
def process_with_confirmation(data: str, ctx: Context) -> str:
    """Process data with payment confirmation"""
    return f"Confirmed payment for: {data}"
```

## Best Practices

### Pricing Strategy

```python
# Good: Use USD pricing for predictability
@price(amount=0.50, currency="USD")
def grammar_check(text: str, ctx: Context) -> str:
    """Grammar check - $0.50 (paid in crypto)"""
    return corrected_text

# Advanced: Offer crypto-native pricing
@price(amount=1000, currency="USDC")  # $1.00 in USDC
def premium_analysis(data: str, ctx: Context) -> dict:
    """Premium analysis - 1000 USDC"""
    return detailed_analysis(data)
```

### User Experience

```python
# Clear Walleot payment messaging
@mcp.tool()
@price(amount=0.25, currency="USD")
def analyze_with_walleot(input: str, ctx: Context) -> str:
    """Analyze input using AI with Walleot payment"""
    return analyze(input)
```

### Performance Optimization

- **Use ELICITATION flow** for best UX
- **Price in USD** for predictability
- **Enable auto-conversion** in dashboard
- **Monitor network fees** during high congestion

## Advantages Over Traditional Payments

### Speed
- **Instant settlement** vs 2-7 business days
- **24/7 processing** vs business hours only
- **Real-time confirmation** vs batch processing

### Global Access
- **No geographic restrictions**
- **No bank account required**
- **Accessible to unbanked populations**

### Cost Efficiency
- **Lower transaction fees** (typically 0.5-2%)
- **No chargeback risk**
- **No currency conversion fees**

### Developer Benefits
- **Simpler integration** than traditional banking
- **Real-time payment status**
- **Programmable money** capabilities

## Migration Guide

### From Traditional Payments

```python
# Before: Traditional payment processor
PayMCP(mcp, providers={
    "stripe": {"apiKey": "sk_..."}  # 2.9% + 30¢ fees, 2-7 day settlement
})

# After: Walleot crypto payments  
PayMCP(mcp, providers={
    "walleot": {"apiKey": "wk_..."}  # ~1% fees, instant settlement
})

# Your tools remain unchanged!
```

### Hybrid Approach

Offer both traditional and crypto payments:

```python
# TODO: Multi-provider support coming soon
# Will allow users to choose payment method

PayMCP(mcp, providers={
    "stripe": {"apiKey": "sk_..."},    # For traditional users
    "walleot": {"apiKey": "wk_..."},   # For crypto users
})
```

## Compliance & Security

### KYC Requirements
- **Business accounts**: Required for settlement
- **API access**: Available after verification
- **Transaction limits**: Higher limits with completed KYC

### Security Features
- **Multi-signature wallets** for fund security
- **Cold storage** for large amounts
- **Insurance coverage** for qualified accounts
- **24/7 monitoring** for suspicious activity

### Regulatory Compliance
- **SOC 2 Type II** certified
- **GDPR compliant** data handling
- **AML/KYC** compliance programs
- **Regular security audits**

## Troubleshooting


### Debug Mode

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# PayMCP will log all Walleot API interactions
# Including payment status, network confirmations, etc.
```

## Next Steps

- **[Test Integration](../quickstart#testing-your-integration)** - Start with testnet
- **[Payment Flows](../concepts-and-flows#elicitation-flow)** - Optimize for crypto UX  
- **[Examples](../examples/paid-image-generator)** - See crypto payments in action
- **[Compare Providers](#)** - Crypto vs traditional payments

## Support

- **Walleot Documentation**: [docs.walleot.com](https://docs.walleot.com)
- **PayMCP Issues**: [GitHub Issues](https://github.com/PayMCP/paymcp/issues)
- **Walleot Support**: Available 24/7 in your dashboard
- **Developer Discord**: [Join our community](https://discord.gg/walleot)
