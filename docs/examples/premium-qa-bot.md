---
id: premium-qa-bot
title: "Example: Premium Q&A Bot"
description: Implement freemium model with free basic answers and paid premium features
---

# Premium Q&A Bot

Learn how to implement a freemium model where basic Q&A is free, but premium features like detailed analysis, sources, and expert-level responses require payment.

## Overview

This example demonstrates:
- **Freemium model** - Free basic answers, paid premium features
- **Tiered pricing** - Different levels of analysis depth
- **Content differentiation** - Clear value difference between tiers
- **Usage limits** - Rate limiting for free tier
- **Upselling** - Natural progression from free to paid

## Complete Implementation

### 1. Basic Setup

```python
# server.py
import os
from datetime import datetime, timedelta
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price, PaymentFlow

# Initialize MCP server
mcp = FastMCP("Expert Q&A Assistant")

## Setup

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price
from paymcp.providers import StripeProvider

mcp = FastMCP("Expert Q&A Assistant")
PayMCP(mcp, providers=[StripeProvider(apiKey="sk_test_...")])


### 2. Free Tier - Basic Q&A

```python
@mcp.tool()
async def ask_question_free(
    question: str,
    ctx: Context
) -> dict:
    """
    Get a basic answer to your question - FREE
    
    Daily limit: 5 questions per user
    Features: Basic answer, no sources, no analysis
    
    Args:
        question: Your question (any topic)
    
    Returns:
        dict: Basic answer with limitations notice
    """
    
    # Simple rate limiting (replace with proper implementation)
    user_id = getattr(ctx, 'user_id', 'anonymous')
    today = datetime.now().strftime('%Y-%m-%d')
    usage_key = f"{user_id}:{today}"
    
    current_usage = user_usage.get(usage_key, 0)
    if current_usage >= FREE_QUESTIONS_PER_DAY:
        return {
            "error": "Daily limit reached",
            "message": f"You've used all {FREE_QUESTIONS_PER_DAY} free questions today.",
            "upgrade_suggestion": "Try ask_question_premium for unlimited access and better answers!",
            "reset_time": "Usage resets at midnight UTC"
        }
    
    # Increment usage
    user_usage[usage_key] = current_usage + 1
    
    # Generate basic answer (simulated)
    basic_answer = await generate_basic_answer(question)
    
    remaining = FREE_QUESTIONS_PER_DAY - user_usage[usage_key]
    
    return {
        "answer": basic_answer,
        "tier": "free",
        "features_included": ["Basic answer"],
        "features_excluded": ["Sources", "Detailed analysis", "Follow-up suggestions"],
        "remaining_free_questions": remaining,
        "upgrade_message": "Get detailed answers with sources for just $0.50!" if remaining <= 2 else None
    }
```

### 3. Premium Tier - Detailed Analysis

```python
@mcp.tool()
@price(amount=0.50, currency="USD")
async def ask_question_premium(
    question: str,
    include_sources: bool = True,
    analysis_depth: str = "detailed",
    ctx: Context
) -> dict:
    """
    Get a comprehensive answer with sources and analysis - $0.50
    
    Features:
    • Detailed, expert-level response
    • Credible sources and citations
    • Related topic suggestions
    • No daily limits
    
    Args:
        question: Your question (any topic)
        include_sources: Include source citations
        analysis_depth: detailed, comprehensive, or expert
    
    Returns:
        dict: Comprehensive answer with sources and analysis
    """
    
    # Validate input
    if len(question.strip()) < 10:
        raise ValueError("Please provide a more detailed question (10+ characters)")
    
    valid_depths = ["detailed", "comprehensive", "expert"]
    if analysis_depth not in valid_depths:
        analysis_depth = "detailed"
    
    # Generate comprehensive answer
    answer_data = await generate_premium_answer(
        question=question,
        include_sources=include_sources,
        depth=analysis_depth
    )
    
    return {
        "answer": answer_data["main_answer"],
        "key_points": answer_data["key_points"],
        "sources": answer_data["sources"] if include_sources else [],
        "related_topics": answer_data["related_topics"],
        "confidence_score": answer_data["confidence"],
        "tier": "premium",
        "analysis_depth": analysis_depth,
        "word_count": len(answer_data["main_answer"].split()),
        "research_time": "~2-3 minutes of AI research"
    }
```

### 4. Expert Tier - Maximum Depth

```python
@mcp.tool()
@price(amount=1.99, currency="USD")
async def ask_question_expert(
    question: str,
    domain: str = "general",
    include_counterarguments: bool = True,
    custom_research_focus: str = "",
    ctx: Context
) -> dict:
    """
    Get expert-level analysis with custom research focus - $1.99
    
    Features:
    • Expert-level depth and analysis
    • Domain-specific expertise
    • Counterarguments and multiple perspectives
    • Custom research angles
    • Academic-quality sources
    • Follow-up question suggestions
    
    Args:
        question: Your complex question
        domain: Expertise area (tech, business, science, law, medicine, etc.)
        include_counterarguments: Include opposing viewpoints
        custom_research_focus: Specific angle or aspect to emphasize
    
    Returns:
        dict: Expert-level analysis with comprehensive research
    """
    
    # Enhanced validation for expert tier
    if len(question.strip()) < 20:
        raise ValueError("Expert analysis requires detailed questions (20+ characters)")
    
    # Generate expert-level response
    expert_data = await generate_expert_answer(
        question=question,
        domain=domain,
        include_counterarguments=include_counterarguments,
        custom_focus=custom_research_focus
    )
    
    return {
        "executive_summary": expert_data["summary"],
        "detailed_analysis": expert_data["analysis"],
        "key_insights": expert_data["insights"],
        "counterarguments": expert_data["counterarguments"] if include_counterarguments else [],
        "expert_sources": expert_data["sources"],
        "methodology": expert_data["methodology"],
        "confidence_assessment": expert_data["confidence_breakdown"],
        "follow_up_questions": expert_data["follow_ups"],
        "domain_expertise": domain,
        "custom_focus": custom_research_focus,
        "tier": "expert",
        "research_depth": "Academic-level",
        "analysis_time": "~10-15 minutes of specialized research"
    }
```

## Key Benefits

### Freemium Model Advantages

1. **Low Barrier to Entry** - Users can try the service risk-free
2. **Natural Upselling** - Users see value before paying
3. **Viral Growth** - Free tier encourages sharing and word-of-mouth
4. **Data Collection** - Learn user behavior and preferences
5. **Market Validation** - Test demand before investing in features

### Revenue Optimization

```python
# Pricing psychology insights
PRICING_TIERS = {
    "basic": {"price": 0.00, "value": "Quick answers"},
    "premium": {"price": 0.50, "value": "Detailed + sources"},  # Sweet spot
    "expert": {"price": 1.99, "value": "Academic-level analysis"}  # Anchor price
}

# The premium tier ($0.50) becomes the attractive middle option
```

## Usage Examples

### Free User Journey

```python
# Day 1: User tries free tier
response1 = await ask_question_free("What is machine learning?")
# Gets basic answer, 4 questions remaining

# Day 1: User asks more questions
response2 = await ask_question_free("How does AI work?") 
# Gets basic answer, 3 questions remaining

# Day 1: After 5 questions
response6 = await ask_question_free("What is deep learning?")
# Gets limit exceeded message with upgrade suggestion
```

### Premium User Experience

```python
# User upgrades to premium
response = await ask_question_premium(
    question="How will artificial intelligence impact healthcare in the next decade?",
    include_sources=True,
    analysis_depth="comprehensive"
)

# Gets detailed analysis with:
# - Comprehensive multi-paragraph answer
# - Credible sources and citations
# - Related topics to explore
# - No daily limits
```

## Conversion Optimization

### Upgrade Triggers

1. **Usage Limit Hit** - Natural upselling moment
2. **Complex Questions** - Free tier can't handle complexity
3. **Source Requests** - Users asking "where did this come from?"
4. **Follow-up Questions** - Users want to go deeper

### Value Demonstration

```python
# Show value difference clearly
FREE_EXAMPLE = "Basic answer: AI is machine learning technology."

PREMIUM_EXAMPLE = """
Detailed answer: Artificial Intelligence encompasses multiple technologies including machine learning, neural networks, and natural language processing. 

Key applications include:
• Healthcare diagnostics and drug discovery
• Autonomous vehicles and transportation
• Financial fraud detection and trading

Sources:
• MIT Technology Review: "AI in Healthcare" (2024)
• Stanford AI Index Report (2024)
• Nature Medicine: "AI Diagnostics Study" (2024)

Related topics: Machine Learning, Deep Learning, Neural Networks
"""
```


## Next Steps

- **[Implement Usage Analytics](../quickstart#production-checklist)** - Track user behavior
- **[A/B Test Pricing](../providers/stripe)** - Optimize conversion rates  
- **[Multi-Provider Support](../providers/walleot)** - Accept crypto payments

This freemium model demonstrates how PayMCP enables sophisticated pricing strategies that maximize both user adoption and revenue.