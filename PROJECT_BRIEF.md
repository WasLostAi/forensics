# Solana Forensics Toolkit

## Introduction
The Solana ecosystem requires more advanced forensic analysis capabilities to support the growing needs of security researchers, investigators, and compliance teams. This toolkit enables precise tracking and visualization of on-chain fund movements. The solution provides sophisticated transaction flow mapping, detailed wallet analysis, and accurate entity identification across the Solana blockchain.

## Features

### Transaction Flow Visualization
- Interactive flow charts between wallets
- Filters for date/amount
- Highlight critical paths

### Wallet Analysis
- Funding source tracking
- Complete history of origin of funds
- Activity patterns
- Entity connections

### Transaction Clustering
- Group related transactions
- Identify associated wallets
- Flag unusual movements

### Entity and Exchange Labeling
- Exchange/project address dataset
- Deposit/withdrawal pattern detection
- Entity Labels

### Risk Scoring
- Multi-factor risk assessment
- Wallet reputation scoring
- Transaction risk evaluation

### Monitoring Dashboard
- Real-time alerts for suspicious activities
- Wallet monitoring
- Token creation monitoring
- ICO/IDO launch monitoring

### Investigation Management
- Create and manage investigations
- Collaboration tools
- Export and reporting

## Technical Implementation

### Frontend
- Next.js App Router
- React components
- Tailwind CSS for styling
- shadcn/ui component library

### Backend
- Solana RPC integration via QuickNode
- Supabase for database and authentication
- Arkham API integration for additional data

### Data Processing
- Transaction clustering algorithms
- Risk scoring models
- Entity identification heuristics

## Setup Instructions

### Prerequisites
- Node.js 18+
- Solana RPC endpoint (QuickNode recommended)
- Supabase account
- Arkham API credentials (optional)

### Environment Variables
- `NEXT_PUBLIC_QUICKNODE_RPC_URL`: Solana RPC endpoint
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `ARKHAM_API_KEY`: Arkham API key (optional)
- `ARKHAM_API_SECRET`: Arkham API secret (optional)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Usage Guide

### Wallet Analysis
Enter a Solana wallet address to view detailed transaction history, token holdings, and risk assessment.

### Transaction Flow
Visualize the flow of funds between wallets with customizable filters for date ranges and transaction amounts.

### Entity Management
View and manage the database of known entities, including exchanges, projects, and other significant addresses.

### Investigations
Create and manage investigations, add relevant wallets and transactions, and generate comprehensive reports.

### Monitoring
Set up alerts for suspicious activities, new token launches, and unusual movements from monitored wallets.
