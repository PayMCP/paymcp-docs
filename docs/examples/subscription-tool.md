---
id: subscription-tool
title: "Example: Subscription Tool"
description: Implement monthly subscription access to premium tools and features
---

# Subscription Tool

Learn how to implement monthly subscription access to premium tools. This example shows how to gate advanced features behind recurring payments while providing clear value propositions.

## Overview

This example demonstrates:
- **Monthly subscription model** - Recurring access to premium features
- **Access control** - Verify subscription status before tool execution
- **Subscription tiers** - Different feature sets at different price points
- **Usage tracking** - Monitor subscription usage and limits
- **Subscription management** - Handle upgrades, downgrades, and cancellations

## Complete Implementation

### 1. Basic Setup

```python
# server.py
import os
from datetime import datetime, timedelta
from mcp.server.fastmcp import FastMCP, Context
from paymcp import PayMCP, price, PaymentFlow

# Initialize MCP server
mcp = FastMCP("Premium Analytics Suite")

# Configure PayMCP
PayMCP(
    mcp,
    providers={
        "stripe": {
            "apiKey": os.getenv("STRIPE_SECRET_KEY"),
            "success_url": "https://yourapp.com/subscription-success",
            "cancel_url": "https://yourapp.com/subscription-cancel"
        }
    },
    payment_flow=PaymentFlow.TWO_STEP
)

# Subscription tracking (in production, use database)
active_subscriptions = {}
usage_tracking = {}
```

### 2. Subscription Plans

```python
@mcp.tool()
@price(amount=9.99, currency="USD")
async def subscribe_starter_plan(ctx: Context) -> dict:
    """
    Subscribe to Starter Plan - $9.99/month
    
    Features included:
    • Advanced data analysis (50 requests/month)
    • Basic reporting and charts
    • Email support
    • API access
    
    Returns:
        dict: Subscription details and access information
    """
    
    user_id = getattr(ctx, 'user_id', 'anonymous')
    subscription_id = f"starter_{user_id}_{datetime.now().timestamp()}"
    
    expiry_date = datetime.now() + timedelta(days=30)
    
    subscription_data = {
        "subscription_id": subscription_id,
        "user_id": user_id,
        "plan": "starter",
        "status": "active",
        "features": [
            "advanced_analysis",
            "basic_reporting", 
            "email_support",
            "api_access"
        ],
        "limits": {
            "analysis_requests": 50,
            "reports_per_month": 10,
            "api_calls_per_day": 1000
        },
        "expires_at": expiry_date.isoformat(),
        "amount": 9.99,
        "currency": "USD"
    }
    
    # Store subscription (use database in production)
    active_subscriptions[user_id] = subscription_data
    usage_tracking[user_id] = {
        "analysis_requests_used": 0,
        "reports_generated": 0,
        "api_calls_today": 0
    }
    
    return {
        "message": "Welcome to the Starter Plan!",
        "subscription": subscription_data,
        "access_granted": subscription_data["features"]
    }

@mcp.tool()
@price(amount=29.99, currency="USD")
async def subscribe_professional_plan(ctx: Context) -> dict:
    """
    Subscribe to Professional Plan - $29.99/month
    
    Features included:
    • Advanced data analysis (unlimited)
    • Professional reporting and dashboards
    • Priority support
    • API access with higher limits
    • Custom integrations
    • Team collaboration features
    
    Returns:
        dict: Subscription details and access information
    """
    
    user_id = getattr(ctx, 'user_id', 'anonymous')
    
    expiry_date = datetime.now() + timedelta(days=30)
    
    subscription_data = {
        "user_id": user_id,
        "plan": "professional",
        "status": "active",
        "features": [
            "unlimited_analysis",
            "professional_reporting",
            "priority_support"
        ],
        "limits": {
            "analysis_requests": "unlimited",
            "api_calls_per_day": 10000
        },
        "expires_at": expiry_date.isoformat(),
        "amount": 29.99
    }
    
    active_subscriptions[user_id] = subscription_data
    
    return {
        "message": "Welcome to the Professional Plan!",
        "subscription": subscription_data
    }
```

### 3. Subscription-Gated Tools

```python
def check_subscription_access(user_id: str, required_feature: str) -> tuple[bool, dict]:
    """Check if user has access to a feature"""
    
    if user_id not in active_subscriptions:
        return False, {
            "error": "No active subscription",
            "message": "This feature requires a subscription.",
            "required_subscription": "Any active plan"
        }
    
    subscription = active_subscriptions[user_id]
    
    # Check if subscription is expired
    expiry = datetime.fromisoformat(subscription["expires_at"])
    if datetime.now() > expiry:
        return False, {
            "error": "Subscription expired",
            "message": f"Your {subscription['plan']} plan expired.",
            "renewal_needed": True
        }
    
    return True, subscription

@mcp.tool()
async def advanced_data_analysis(
    dataset_url: str,
    analysis_type: str = "comprehensive",
    ctx: Context
) -> dict:
    """
    Perform advanced data analysis - Requires Subscription
    
    Subscription required: Starter ($9.99/month) or Professional ($29.99/month)
    
    Args:
        dataset_url: URL to your CSV/JSON dataset
        analysis_type: Type of analysis (basic, comprehensive, predictive)
    
    Returns:
        dict: Detailed analysis results with insights and visualizations
    """
    
    user_id = getattr(ctx, 'user_id', 'anonymous')
    
    # Check subscription access
    has_access, access_info = check_subscription_access(user_id, "advanced_analysis")
    if not has_access:
        return access_info
    
    subscription = access_info
    usage = usage_tracking.get(user_id, {})
    
    # Check usage limits for Starter plan
    if subscription["plan"] == "starter":
        if usage.get("analysis_requests_used", 0) >= subscription["limits"]["analysis_requests"]:
            return {
                "error": "Monthly limit reached",
                "message": f"You've used all {subscription['limits']['analysis_requests']} analysis requests this month",
                "upgrade_suggestion": "Upgrade to Professional for unlimited analysis requests"
            }
        
        # Increment usage
        usage["analysis_requests_used"] = usage.get("analysis_requests_used", 0) + 1
        usage_tracking[user_id] = usage
    
    # Perform analysis (simulated)
    analysis_result = {
        "summary": f"Advanced {analysis_type} analysis of dataset",
        "key_insights": [
            "Data trend 1: Significant growth pattern detected",
            "Data trend 2: Seasonal variations identified", 
            "Data trend 3: Outliers and anomalies flagged"
        ],
        "recommendations": [
            "Recommendation 1: Optimize for peak periods",
            "Recommendation 2: Address data quality issues"
        ]
    }
    
    remaining_requests = None
    if subscription["plan"] == "starter":
        remaining_requests = subscription["limits"]["analysis_requests"] - usage["analysis_requests_used"]
    
    return {
        "analysis_results": analysis_result,
        "subscription_info": {
            "plan": subscription["plan"],
            "remaining_requests": remaining_requests or "unlimited"
        }
    }
```

## Key Benefits

### For Users

1. **Predictable Costs** - Fixed monthly fee for access
2. **Feature Access** - Unlock advanced capabilities 
3. **No Usage Anxiety** - No per-use charges within limits
4. **Scalable Plans** - Upgrade as needs grow
5. **Cancel Anytime** - Flexible subscription management

### For Developers

1. **Recurring Revenue** - Predictable monthly income
2. **Higher LTV** - Subscribers typically worth more than one-time buyers
3. **Usage Control** - Manage costs with usage limits
4. **Feature Gating** - Clear value differentiation
5. **Customer Insights** - Track usage patterns and preferences

## Pricing Strategy

| Plan | Price | Target User | Key Features |
|------|-------|-------------|--------------|
| **Starter** | $9.99/month | Individual users | Limited but sufficient for personal use |
| **Professional** | $29.99/month | Business users | Unlimited usage + advanced features |

## Usage Examples

### New User Journey

```python
# User subscribes to Starter
subscription = await subscribe_starter_plan()
# Gets access to advanced features with limits

# User tries advanced analysis
result = await advanced_data_analysis(
    dataset_url="https://example.com/sales_data.csv",
    analysis_type="comprehensive"
)
# Works! Shows usage remaining
```

### Professional User Experience

```python
# User upgrades to Professional
pro_subscription = await subscribe_professional_plan()

# User gets unlimited access to all features
# No usage limits or restrictions
```

## Next Steps

- **[Implement Real Subscriptions](../providers/stripe)** - Use Stripe subscriptions
- **[Add Usage Analytics](../quickstart#production-checklist)** - Track detailed usage
- **[Multi-Tier Features](#)** - Build more subscription tiers

This subscription model shows how PayMCP can handle recurring payments and feature gating for SaaS-style applications.


