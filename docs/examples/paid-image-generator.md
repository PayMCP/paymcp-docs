---
id: paid-image-generator
title: "Example: Paid Image Generator"
description: Complete example of monetizing an AI image generation tool with PayMCP
---

# Paid Image Generator

Learn how to monetize an AI image generation tool by charging users per image. This example demonstrates pay-per-use pricing, different quality tiers, and handling expensive compute operations.

## Overview

This example shows how to:
- Charge users per image generation
- Offer different pricing tiers (basic, premium, ultra)
- Handle expensive compute operations safely
- Integrate with multiple payment providers
- Provide clear value proposition to users

## Complete Implementation

### 1. Basic Setup

```python
# server.py
import asyncio
import os
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price, PaymentFlow

# Initialize MCP server
mcp = FastMCP("AI Image Generator")

# Configure PayMCP with your preferred provider (multiple options available in 0.2.0)

# Option 1: Config mapping (traditional)
PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": os.getenv("STRIPE_SECRET_KEY"),
            "success_url": "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://yourapp.com/cancel"
        }
    },
    payment_flow=PaymentFlow.PROGRESS  # Good for longer operations
)

# Option 2: Provider instances (new in 0.2.0)
from paymcp.providers import StripeProvider
PayMCP(
    mcp,
    providers={
        "stripe": StripeProvider(
            apiKey=os.getenv("STRIPE_SECRET_KEY"),
            success_url="https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://yourapp.com/cancel"
        )
    },
    payment_flow=PaymentFlow.PROGRESS
)

# Option 3: List of instances (new in 0.2.0)
PayMCP(
    mcp,
    providers=[
        StripeProvider(
            apiKey=os.getenv("STRIPE_SECRET_KEY"),
            success_url="https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://yourapp.com/cancel"
        )
    ],
    payment_flow=PaymentFlow.PROGRESS
)
```

### 2. Image Generation Tools

```python
# Basic tier - affordable option
@mcp.tool()
@price(amount=0.25, currency="USD")
async def generate_image_basic(
    prompt: str, 
    aspect_ratio: str = "1:1",
    ctx: Context
) -> dict:
    """
    Generate a basic quality AI image - $0.25
    
    Args:
        prompt: Description of the image to generate
        aspect_ratio: Image dimensions (1:1, 16:9, 9:16, 4:3)
    
    Returns:
        dict: Generated image URL and metadata
    """
    
    # Validate inputs
    if len(prompt.strip()) < 10:
        raise ValueError("Prompt must be at least 10 characters long")
    
    valid_ratios = ["1:1", "16:9", "9:16", "4:3"]
    if aspect_ratio not in valid_ratios:
        raise ValueError(f"Aspect ratio must be one of: {valid_ratios}")
    
    # Generate image (this is where your AI model runs)
    image_url = await generate_ai_image(
        prompt=prompt,
        quality="basic",
        aspect_ratio=aspect_ratio,
        steps=20,  # Lower quality = fewer steps = lower cost
        resolution="512x512"
    )
    
    return {
        "image_url": image_url,
        "prompt": prompt,
        "quality": "basic",
        "resolution": "512x512",
        "aspect_ratio": aspect_ratio,
        "generation_time": "~30 seconds"
    }

# Premium tier - higher quality
@mcp.tool()
@price(amount=0.75, currency="USD")
async def generate_image_premium(
    prompt: str,
    style: str = "photorealistic",
    aspect_ratio: str = "1:1",
    ctx: Context
) -> dict:
    """
    Generate a premium quality AI image - $0.75
    
    Args:
        prompt: Description of the image to generate
        style: Art style (photorealistic, artistic, cartoon, abstract)
        aspect_ratio: Image dimensions (1:1, 16:9, 9:16, 4:3)
    
    Returns:
        dict: Generated image URL and metadata
    """
    
    # Validate inputs
    if len(prompt.strip()) < 5:
        raise ValueError("Prompt must be at least 5 characters long")
        
    valid_styles = ["photorealistic", "artistic", "cartoon", "abstract"]
    if style not in valid_styles:
        raise ValueError(f"Style must be one of: {valid_styles}")
    
    # Generate higher quality image
    image_url = await generate_ai_image(
        prompt=f"{prompt}, {style} style",
        quality="premium", 
        aspect_ratio=aspect_ratio,
        steps=50,  # More steps = higher quality
        resolution="1024x1024"
    )
    
    return {
        "image_url": image_url,
        "prompt": prompt,
        "style": style,
        "quality": "premium",
        "resolution": "1024x1024", 
        "aspect_ratio": aspect_ratio,
        "generation_time": "~60 seconds"
    }
```

## Usage Examples

### Basic Image Generation

```python
# User calls the tool
result = await generate_image_basic(
    prompt="A beautiful sunset over mountains",
    aspect_ratio="16:9"
)

# Payment flow:
# 1. User gets payment link for $0.25
# 2. User pays via Stripe/PayPal/etc
# 3. Image generation starts automatically
# 4. User receives image URL and metadata
```

### Premium Quality with Style

```python
result = await generate_image_premium(
    prompt="A majestic dragon flying over a medieval castle",
    style="artistic",
    aspect_ratio="1:1"
)

# Returns higher resolution (1024x1024) artistic image
```

## Key Benefits

### For Users

1. **Pay Per Use** - Only pay for images you actually generate
2. **Transparent Pricing** - Clear cost for each quality tier
3. **No Subscriptions** - No monthly fees or commitments
4. **Immediate Access** - Generate images on-demand
5. **Quality Options** - Choose the right quality for your budget

### For Developers

1. **Cost Protection** - Payment before expensive compute
2. **Scalable Pricing** - Different tiers for different use cases
3. **Revenue Stream** - Monetize AI capabilities directly
4. **Global Access** - Accept payments worldwide
5. **No Chargebacks** - Secure payment processing

## Pricing Strategy

| Tier | Price | Resolution | Quality | Use Case |
|------|-------|------------|---------|----------|
| **Basic** | $0.25 | 512x512 | Good | Quick concepts, drafts |
| **Premium** | $0.75 | 1024x1024 | High | Social media, presentations |
| **Ultra** | $1.99 | 2048x2048 | Maximum | Professional, print-ready |

## Advanced Configuration (0.2.0+)

### Custom Provider Integration

Based on the extensible provider system in 0.2.0, you can create custom providers:

```python
from paymcp.providers import BasePaymentProvider

class CustomImageProvider(BasePaymentProvider):
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        super().__init__(**kwargs)
    
    def create_payment(self, amount: float, currency: str, description: str):
        # Return (payment_id, payment_url)
        return "unique-payment-id", "https://example.com/pay"
    
    def get_payment_status(self, payment_id: str) -> str:
        return "paid"

# Use custom provider with any configuration method
PayMCP(mcp, providers=[CustomImageProvider(api_key="...")])
```

### Mixed Configuration Styles

```python
# Mix different configuration styles in same setup
from paymcp.providers import WalleotProvider, CoinbaseProvider

PayMCP(
    mcp,
    providers={
        "stripe": {"apiKey": os.getenv("STRIPE_API_KEY")},  # Config dict
        "walleot": WalleotProvider(api_key=os.getenv("WALLEOT_API_KEY")),  # Instance
        "custom": CustomImageProvider(api_key="...")  # Custom instance
    }
)
# Note: right now the first configured provider is used
```

## Next Steps

- **[Deploy to Production](../quickstart#production-checklist)** - Go live checklist
- **[Add More Providers](../providers/walleot)** - Accept crypto payments
- **[Implement Analytics](#)** - Track usage and revenue
- **[Scale Infrastructure](#)** - Handle high demand

This example demonstrates how PayMCP enables new business models by making it easy to charge for expensive AI operations.