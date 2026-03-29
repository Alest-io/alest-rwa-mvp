# Skill: Frontend Development

## When to Use
When building or modifying the React frontend in `app/`.

## Tech Stack
- React + TypeScript
- Solana Wallet Adapter (@solana/wallet-adapter-react)
- Anchor client library (@coral-xyz/anchor)
- Tailwind CSS for styling

## Key Components

### Wallet Connection
- Use `WalletMultiButton` from wallet adapter
- Support: Phantom (primary), Solflare, Backpack
- Always show connection state clearly

### Investment Flow
1. User connects wallet
2. User selects amount (slider or input, min $50)
3. Preview: tokens to receive, fees, confirmation
4. Sign transaction
5. Show success/failure with explorer link

### Portfolio Dashboard
- Show user's token balance
- Show claimable revenue
- Show asset details (name, total value, revenue history)

## Rules

- NEVER store private keys in frontend code
- ALWAYS use environment variables for RPC endpoints
- Show loading states for all async operations
- Handle wallet disconnection gracefully
- All amounts displayed in USD with SOL equivalent
- Mobile-responsive design (target audience uses phones)
- Spanish + English UI (audience: Latin Americans)

## File Structure
```
app/src/
├── components/
│   ├── WalletConnect.tsx
│   ├── InvestForm.tsx
│   ├── Portfolio.tsx
│   └── AssetCard.tsx
├── hooks/
│   ├── useAsset.ts
│   ├── useInvest.ts
│   └── useRevenue.ts
├── utils/
│   ├── anchor.ts        ← Program client setup
│   ├── constants.ts     ← Program ID, RPC URL
│   └── format.ts        ← Number/currency formatting
├── App.tsx
└── main.tsx
```
