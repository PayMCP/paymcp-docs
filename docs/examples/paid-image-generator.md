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

## Setup

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price
from paymcp.providers import StripeProvider

mcp = FastMCP("AI Image Generator")
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import { FastMCP } from '@mcp/server-fastmcp';
import { PayMCP, price } from 'paymcp';
import { StripeProvider } from 'paymcp/providers';

const mcp = new FastMCP("AI Image Generator");
installPayMCP(mcp, { providers: [StripeProvider({ apiKey: "sk_test_..." })] });
```

</TabItem>
</Tabs>

### 2. Image Generation Tools

<Tabs>
<TabItem value="python" label="Python">

```python
# Basic tier - affordable option
@mcp.tool()
@price(amount=0.25, currency="USD")
async def generate_ai_image(
    prompt: str, 
    aspect_ratio: str = "1:1",
    ctx: Context
) -> dict:
    """Generate an AI image from text prompt"""
    
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
    
    return dict(
        image_url=image_url,
        prompt=prompt,
        quality="basic",
        resolution="512x512",
        aspect_ratio=aspect_ratio,
        generation_time="~30 seconds"
    )
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// Basic tier - affordable option
@mcp.tool()
@price({ amount: 0.25, currency: "USD" })
async function generateImageBasic(
    prompt: string, 
    aspectRatio: string = "1:1",
    ctx: Context
): Promise<object> {
    /**
     * Generate a basic quality AI image - $0.25
     * 
     * @param prompt Description of the image to generate
     * @param aspectRatio Image dimensions (1:1, 16:9, 9:16, 4:3)
     * @returns Generated image URL and metadata
     */
    
    // Validate inputs
    if (prompt.trim().length < 10) {
        throw new Error("Prompt must be at least 10 characters long");
    }
    
    const validRatios = ["1:1", "16:9", "9:16", "4:3"];
    if (!validRatios.includes(aspectRatio)) {
        throw new Error(`Aspect ratio must be one of: ${validRatios.join(', ')}`);
    }
    
    // Generate image (this is where your AI model runs)
    const imageUrl = await generateAiImage({
        prompt,
        quality: "basic",
        aspectRatio,
        steps: 20,  // Lower quality = fewer steps = lower cost
        resolution: "512x512"
    });
    
    return {
        image_url: imageUrl,
        prompt,
        quality: "basic",
        resolution: "512x512",
        aspect_ratio: aspectRatio,
        generation_time: "~30 seconds"
    };
}
```

</TabItem>
</Tabs>

### Premium Image Generation

<Tabs>
<TabItem value="python" label="Python">

```python
@mcp.tool()
@price(amount=0.75, currency="USD")
async def generate_premium_ai_image(
    prompt: str,
    style: str = "photorealistic",
    ctx: Context
) -> dict:
    """Generate a high-quality AI image with custom art style"""
    
    # Validate inputs
    if len(prompt.strip()) < 5:
        raise ValueError("Prompt must be at least 5 characters long")
        
    valid_styles = ["photorealistic", "artistic", "cartoon", "abstract"]
    if style not in valid_styles:
        raise ValueError(f"Style must be one of: {valid_styles}")
    
    # Generate higher quality image
    image_url = await generate_ai_image(
        prompt=prompt + f", {style} style",
        quality="premium", 
        steps=50,  # More steps = higher quality
        resolution="1024x1024"
    )
    
    return dict(
        image_url=image_url,
        prompt=prompt,
        style=style,
        quality="premium",
        resolution="1024x1024", 
        generation_time="~60 seconds"
    )
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
mcp.tool(
  "generate_premium_ai_image",
  {
    description: "Generate a high-quality AI image with custom art style",
    inputSchema: { 
      prompt: z.string(),
      style: z.string().default("photorealistic")
    },
    price: { amount: 0.75, currency: "USD" },
  },
  async ({ prompt, style }, ctx) => {
    // Validate inputs
    if (prompt.trim().length < 5) {
        throw new Error("Prompt must be at least 5 characters long");
    }
    
    const validStyles = ["photorealistic", "artistic", "cartoon", "abstract"];
    if (!validStyles.includes(style)) {
        throw new Error(`Style must be one of: ${validStyles.join(', ')}`);
    }
    
    // Generate higher quality image
    const imageUrl = await generateAiImage(`${prompt}, ${style} style`, {
        quality: "premium",
        steps: 50,
        resolution: "1024x1024"
    });
    
    return {
        image_url: imageUrl,
        prompt,
        style,
        quality: "premium",
        resolution: "1024x1024",
        generation_time: "~60 seconds"
    };
  }
);
```

</TabItem>
</Tabs>

## Usage Examples

### Basic Image Generation

<Tabs>
<TabItem value="python" label="Python">

```python
# User calls the tool
result = await generate_ai_image(
    prompt="A beautiful sunset over mountains",
    aspect_ratio="16:9"
)

# Payment flow:
# 1. User gets payment link for $0.25
# 2. User pays via provider
# 3. Image generation starts automatically
# 4. User receives image URL and metadata
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
// User calls the tool
const result = await generateAiImage({
    prompt: "A beautiful sunset over mountains",
    aspectRatio: "16:9"
});

// Payment flow:
// 1. User gets payment link for $0.25
// 2. User pays via provider
// 3. Image generation starts automatically
// 4. User receives image URL and metadata
```

</TabItem>
</Tabs>

### Premium Quality with Style

<Tabs>
<TabItem value="python" label="Python">

```python
result = await generate_premium_ai_image(
    prompt="A majestic dragon flying over a medieval castle",
    style="artistic"
)

# Returns higher resolution (1024x1024) artistic image
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
const result = await generatePremiumAiImage({
    prompt: "A majestic dragon flying over a medieval castle",
    style: "artistic"
});

// Returns higher resolution (1024x1024) artistic image
```

</TabItem>
</Tabs>

## Key Benefits

### For Users

1. **Pay Per Use** - Only pay for images you actually generate
2. **Transparent Pricing** - Clear cost for each quality tier
3. **Immediate Access** - Generate images on-demand
4. **Quality Options** - Choose the right quality for your budget

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