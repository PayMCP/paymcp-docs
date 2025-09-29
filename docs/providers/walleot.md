---
id: walleot
title: "Walleot Provider"
description: Accept cryptocurrency payments with instant settlement using Walleot
---

# Walleot Provider

Walleot enables instant cryptocurrency payments with automatic conversion to stablecoins or fiat. Perfect for global, permissionless payments with instant settlement.

## Features

- **Instant Settlement** - Receive payments in seconds, not days
- **Global Access** - No geographic restrictions or bank requirements
- **Low Fees** - Minimal transaction costs compared to traditional payments
- **Cryptocurrency Support** - Bitcoin, Ethereum, USDC, and more
- **Auto-Conversion** - Automatically convert to your preferred currency
- **Developer-Friendly** - Simple API with comprehensive testing tools

## Quick Setup

### 1. Get Your API Keys

1. Sign up at [walleot.com](https://walleot.com)
2. Complete KYC verification (required for settlement)
3. Navigate to **Developers** → **API Keys**
4. Copy your **API Key** (starts with `wk_test_` for testing)

### 2. Configuration Options

PayMCP supports multiple ways to configure the Walleot provider:

#### Option 1: Config Mapping (Default)

```python
from paymcp import PayMCP, PaymentFlow

PayMCP(
    mcp,
    providers={
        "walleot": {
            "apiKey": "wk_test_...",  # Your Walleot API key
        }
    },
    payment_flow=PaymentFlow.ELICITATION  # Recommended for crypto
)
```

#### Option 2: Provider Instance

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import WalleotProvider

walleot_provider = WalleotProvider(
    api_key="wk_test_..."
)

PayMCP(
    mcp,
    providers={"walleot": walleot_provider},
    payment_flow=PaymentFlow.ELICITATION
)
```

#### Option 3: List of Instances

```python
from paymcp import PayMCP, PaymentFlow
from paymcp.providers import WalleotProvider

PayMCP(
    mcp,
    providers=[
        WalleotProvider(api_key="wk_test_...")
    ],
    payment_flow=PaymentFlow.ELICITATION
)
```

### 3. Test Your Integration

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
def crypto_payment_test(message: str, ctx: Context) -> str:
    return f"Crypto payment successful! Message: {message}"
```

Test with small amounts on testnet first.

## Supported Currencies

### Fiat Currencies
- **USD** - US Dollars (recommended)
- **EUR** - Euros
- **GBP** - British Pounds

### Cryptocurrencies
- **BTC** - Bitcoin
- **ETH** - Ethereum
- **USDC** - USD Coin (stablecoin)
- **USDT** - Tether (stablecoin)

```python
# Fiat pricing (recommended)
@price(amount=1.00, currency="USD")
def fiat_priced_tool(input: str, ctx: Context) -> str:
    return "Tool executed"

# Crypto pricing
@price(amount=0.001, currency="BTC")
def btc_priced_tool(input: str, ctx: Context) -> str:
    return "Tool executed"

# Stablecoin pricing
@price(amount=1.00, currency="USDC")
def stablecoin_tool(input: str, ctx: Context) -> str:
    return "Tool executed"
```

## Payment Flows

### Recommended: ELICITATION Flow

Best for crypto payments due to real-time nature:

```python
PayMCP(
    mcp,
    providers={"walleot": {"apiKey": "wk_test_..."}},
    payment_flow=PaymentFlow.ELICITATION
)

@mcp.tool()
@price(amount=0.25, currency="USD")
def instant_crypto_tool(data: str, ctx: Context) -> str:
    # Payment happens instantly, tool executes immediately after
    return f"Processed: {data}"
```

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
# Set your preferred settlement currency in your Walleot dashboard:
# USD, EUR, GBP, or keep as crypto (BTC, ETH, USDC)
```

### Network Preferences

Walleot automatically selects the best network for cost and speed:

- **Bitcoin**: Lightning Network for small amounts, on-chain for larger
- **Ethereum**: Optimistic rollups for lower fees
- **Stablecoins**: Polygon or Arbitrum for minimal fees

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

### Test Wallets

Use these test wallets to simulate payments:
- **Web**: Walleot provides test wallet interface
- **Mobile**: Testnet versions of popular wallets
- **Lightning**: Testnet Lightning wallets

## Error Handling

### Common Errors

```python
# Network congestion
# Walleot automatically retries and uses alternative networks

# Insufficient funds
# Clear error messages to user with exact amounts needed

# Invalid currency
# Check supported currencies in your account dashboard
```

### Timeout Handling

```python
# Crypto payments can have variable confirmation times
# Walleot handles this automatically:

@mcp.tool()
@price(amount=1.00, currency="USD")
def patient_tool(data: str, ctx: Context) -> str:
    # Walleot waits for network confirmation
    # User sees real-time payment status
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
# Clear crypto payment messaging
@mcp.tool()
@price(amount=0.25, currency="USD")
def crypto_tool(input: str, ctx: Context) -> str:
    """
    AI analysis tool - $0.25
    Accepts: Bitcoin, Ethereum, USDC, USDT
    Settlement: Instant via Lightning/L2
    """
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

### Common Issues

**Payment not confirming:**
- Check network status (Bitcoin/Ethereum congestion)
- Verify sufficient gas/fees for transaction
- Wait for network confirmations (varies by currency)

**API key errors:**
- Ensure API key is active and not expired
- Check API key permissions in dashboard
- Verify account KYC status

**Currency not supported:**
- Check available currencies in account dashboard
- Some currencies require account verification
- Regional restrictions may apply

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
