# Polar Payment SDK Integration Guide

This guide explains how to integrate the Polar payment SDK with your IQNIX TV application.

## Prerequisites

1. **Polar Account**: You need a Polar account to access their payment services
2. **Products Setup**: Configure your subscription products in the Polar dashboard
3. **Webhook Endpoint**: Ensure your webhook endpoint is accessible from the internet

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Polar Configuration
NEXT_PUBLIC_POLAR_PUBLISHABLE_KEY="pk_live_..."  # Your Polar publishable key
POLAR_SECRET_KEY="sk_live_..."                   # Your Polar secret key
POLAR_WEBHOOK_SECRET="whsec_..."                 # Webhook secret from Polar dashboard
NEXT_PUBLIC_APP_URL="http://localhost:3000"      # Your app URL
```

## Installation

The required packages are already installed:

```bash
npm install @polar-sh/nextjs @polar-sh/checkout
```

## Configuration

### 1. Polar Configuration (`lib/polar.ts`)

This file contains:
- Polar client configuration
- Product definitions mapping
- Helper functions for subscription management

**Important**: Update the product IDs in `POLAR_PRODUCTS` to match your actual Polar product IDs.

### 2. Database Schema

The Prisma schema already includes the necessary models:
- `Customer`: Links users to Polar customers
- `Subscription`: Stores subscription details
- `WebhookEvent`: Tracks webhook events for debugging

## Components

### Subscription Management Component

Located at `components/subscription-management.tsx`, this component provides:
- Plan selection interface
- Current plan status
- Subscription cancellation
- Integration with checkout flow

### Checkout Page

Located at `app/checkout/[tier]/page.tsx`, this page:
- Shows plan details
- Handles checkout process
- Redirects to Polar payment flow

## API Endpoints

### 1. Checkout API (`/api/checkout`)

Creates checkout sessions for subscription purchases.

### 2. Subscription API (`/api/subscription`)

Manages subscription data:
- GET: Fetch user's subscription
- POST: Create new subscription

### 3. Subscription Cancel API (`/api/subscription/cancel`)

Handles subscription cancellations.

### 4. Webhook Handler (`/api/webhook/polar`)

Processes Polar webhook events:
- Subscription creation
- Subscription updates
- Payment events

## Webhook Setup

1. **Configure Webhook in Polar Dashboard**:
   - URL: `https://yourdomain.com/api/webhook/polar`
   - Events: Select all subscription-related events
   - Copy the webhook secret

2. **Update Environment Variables**:
   - Set `POLAR_WEBHOOK_SECRET` to the copied secret

3. **Test Webhook**:
   - Use Polar's webhook testing tools
   - Check your application logs for webhook events

## Usage Examples

### Basic Subscription Check

```tsx
import { useSubscription } from "@/hooks/use-subscription";

function MyComponent() {
  const { isPremium, currentTier, isLoading } = useSubscription();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isPremium ? (
        <p>Welcome to Premium!</p>
      ) : (
        <p>Upgrade to Premium for more features</p>
      )}
    </div>
  );
}
```

### Subscription Management

```tsx
import { SubscriptionManagement } from "@/components/subscription-management";

function ProfilePage() {
  return (
    <div>
      <h1>Subscription Management</h1>
      <SubscriptionManagement 
        currentTier="FREE" 
        isActive={true} 
      />
    </div>
  );
}
```

## Testing

### 1. Local Development

1. Use Polar's test mode keys
2. Test webhook locally using tools like ngrok
3. Verify subscription creation and updates

### 2. Production Testing

1. Use Polar's live mode keys
2. Test with small amounts
3. Verify webhook delivery and processing

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**:
   - Check webhook URL accessibility
   - Verify webhook secret
   - Check application logs

2. **Subscription Not Updating**:
   - Verify webhook handler logic
   - Check database connections
   - Validate webhook payload structure

3. **Checkout Flow Issues**:
   - Verify Polar keys configuration
   - Check product ID mapping
   - Validate redirect URLs

### Debugging

1. **Enable Logging**: Check console logs for webhook events
2. **Database Queries**: Verify data is being stored correctly
3. **Webhook Testing**: Use Polar's webhook testing tools

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **User Authentication**: Ensure users can only access their own data
3. **Input Validation**: Validate all webhook payloads
4. **Error Handling**: Don't expose sensitive information in error messages

## Next Steps

1. **Customize Products**: Update product configurations to match your needs
2. **Add Analytics**: Track subscription metrics and user behavior
3. **Implement Billing**: Add invoice and payment history features
4. **User Experience**: Enhance the subscription flow with better UX

## Support

- **Polar Documentation**: [https://docs.polar.sh/](https://docs.polar.sh/)
- **Polar Support**: Contact Polar support for payment-related issues
- **Application Issues**: Check the application logs and error handling

## Migration from Other Payment Providers

If you're migrating from another payment provider:

1. **Data Migration**: Export existing subscription data
2. **User Mapping**: Map existing users to new subscription structure
3. **Testing**: Test the new flow with existing users
4. **Rollback Plan**: Have a plan to revert if issues arise

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes on subscription tables
2. **Caching**: Cache subscription status for frequently accessed data
3. **Background Jobs**: Process webhooks asynchronously for better performance
4. **Monitoring**: Set up alerts for webhook failures and subscription issues
