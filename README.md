This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Set up env

```env
DATABASE_URL=""

UPLOADTHING_TOKEN=""

MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

RESEND_API_KEY=""

# AWS Personalize Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Personalize Campaign ARNs
PERSONALIZE_RECOMMENDATIONS_CAMPAIGN_ARN=arn:aws:personalize:region:account:campaign/name
PERSONALIZE_SIMILAR_ITEMS_CAMPAIGN_ARN=arn:aws:personalize:region:account:campaign/name
PERSONALIZE_PERSONALIZED_RANKING_CAMPAIGN_ARN=arn:aws:personalize:region:account:campaign/name

# Personalize Dataset Group
PERSONALIZE_DATASET_GROUP_ARN=arn:aws:personalize:region:account:dataset-group/name

GOOGLE_GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Polar for payment processing - https://polar.sh/
POLAR_ACCESS_TOKEN=
POLAR_SUCCESS_URL=http://localhost:3000
NEXT_PUBLIC_POLAR_PREMIUM_PRODUCT_ID=
NEXT_PUBLIC_POLAR_MAX_PRODUCT_ID=
POLAR_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
