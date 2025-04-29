# Setting up QuickNode for Solana Forensics

This guide will help you set up your QuickNode endpoint for use with the Solana Forensics application.

## 1. Create a QuickNode Account

If you don't already have a QuickNode account:

1. Go to [QuickNode](https://www.quicknode.com/)
2. Sign up for an account
3. Verify your email address

## 2. Create a Solana Endpoint

1. From your QuickNode dashboard, click "Create an endpoint"
2. Select "Solana" as the blockchain
3. Choose "Mainnet" as the network
4. Select your preferred plan (the Basic plan should be sufficient for initial use)
5. Choose a region closest to your deployment location
6. Click "Create"

## 3. Get Your Endpoint URL

1. Once your endpoint is created, you'll see your endpoint details
2. Copy the HTTP Provider URL

## 4. Configure the Application

1. Create a `.env.local` file in the root of your project
2. Add your QuickNode URL:
