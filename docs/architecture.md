# Architecture Overview

## System Design

```
┌──────────────────────────────────────────────────┐
│                    Frontend (React)               │
│  ┌────────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Wallet     │  │ Invest   │  │ Portfolio    │ │
│  │ Connect    │  │ Flow     │  │ Dashboard    │ │
│  └─────┬──────┘  └────┬─────┘  └──────┬───────┘ │
└────────┼──────────────┼────────────────┼─────────┘
         │              │                │
         ▼              ▼                ▼
┌──────────────────────────────────────────────────┐
│              Solana Blockchain                    │
│  ┌──────────────────────────────────────────┐    │
│  │         RWA Token Program (Anchor)        │    │
│  │                                           │    │
│  │  ┌─────────────┐  ┌──────────────────┐   │    │
│  │  │ initialize  │  │ invest           │   │    │
│  │  │ _asset      │  │ (buy tokens)     │   │    │
│  │  ├─────────────┤  ├──────────────────┤   │    │
│  │  │ distribute  │  │ withdraw         │   │    │
│  │  │ _revenue    │  │ (redeem tokens)  │   │    │
│  │  └─────────────┘  └──────────────────┘   │    │
│  │                                           │    │
│  │  Accounts:                                │    │
│  │  - AssetVault (PDA) → asset metadata     │    │
│  │  - TokenMint → SPL token mint            │    │
│  │  - InvestorAccount → per-user holdings   │    │
│  │  - RevenuePool → accumulated revenue     │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

## Key Program Instructions

### 1. `initialize_asset`
Creates a new tokenized asset on-chain.
- Mints SPL tokens representing fractional ownership
- Sets metadata (asset name, total value, token price)
- Creates the AssetVault PDA to store asset state
- Allocates tokens: 70% investors, 20% platform, 10% reserve

### 2. `invest`
Allows a user to purchase tokens.
- Accepts SOL/USDC payment
- Transfers corresponding tokens from investor pool to user
- Creates/updates InvestorAccount for the user
- Validates minimum investment amount

### 3. `distribute_revenue`
Distributes revenue proportionally to token holders.
- Called by asset manager (admin)
- Calculates each holder's share based on token balance
- Deposits revenue into claimable accounts

### 4. `withdraw`
Allows investors to claim distributed revenue.
- Reads user's claimable balance
- Transfers SOL/USDC to user's wallet
- Resets claimable balance to zero

## PDA Seeds

| Account | Seeds | Description |
|---------|-------|-------------|
| AssetVault | `["asset", asset_id]` | Stores asset metadata & state |
| InvestorAccount | `["investor", asset_id, user_pubkey]` | Per-user investment record |
| RevenuePool | `["revenue", asset_id]` | Accumulated revenue for distribution |

## Security Considerations

- All account validations use Anchor's account constraints
- Admin operations restricted via `has_one` checks
- Token transfers use CPI to SPL Token program
- PDA seeds prevent account collision
- No hardcoded keys — everything via config
