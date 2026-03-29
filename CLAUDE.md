# ALEST.IO — RWA Tokenization MVP

## Purpose

Alest.io democratizes investment in productive physical assets by tokenizing them on Solana.
Pilot asset: a Tesla robotaxi (~$40,000 → 40,000 tokens at $1 each).
Revenue from transport, advertising, and appreciation flows proportionally to token holders.

This repo is the **Solana Frontier Hackathon MVP** (April 6 – May 11, 2026).

## Token Distribution

- 70% → investors (public sale)
- 20% → platform (alest.io operations)
- 10% → reserve fund

## Repo Map

```
alest-rwa-mvp/
├── CLAUDE.md              ← You are here. Project context & rules.
├── programs/              ← Solana programs (Anchor framework)
│   └── rwa-token/         ← Main tokenization program
├── app/                   ← Frontend (React + Solana wallet adapter)
├── tests/                 ← Integration & unit tests
├── docs/                  ← Architecture, ADRs, runbooks
├── scripts/               ← Deploy, seed, utility scripts
├── .claude/               ← Skills, hooks, settings
└── Anchor.toml            ← Anchor project config
```

## Tech Stack

- **Blockchain:** Solana (mainnet-beta for prod, devnet for testing)
- **Smart Contracts:** Anchor framework (Rust)
- **Token Standard:** SPL Token / Token-2022
- **Frontend:** React + TypeScript + Solana Wallet Adapter
- **Wallets:** Phantom, MetaMask (via Solana Snap)
- **Identity:** alest.io (ENS), alest.eth, Phantom @AlestIo

## Rules

- NEVER modify `programs/rwa-token/src/lib.rs` without running `anchor test` first
- NEVER hardcode private keys or seed phrases anywhere
- ALWAYS use environment variables for RPC endpoints and program IDs
- ALWAYS write tests before implementing new instructions
- Use `anchor build && anchor test` to validate changes
- Keep all amounts in lamports/smallest unit internally, convert only in frontend
- Follow Solana security best practices: validate all accounts, use proper PDA seeds
- Target audience: Latin Americans in the US, gig economy workers, crypto-native investors
- Minimum investment target: ~$50–$100 USD equivalent

## Common Commands

```bash
# Build the program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Generate new keypair
solana-keygen new --outfile ./target/deploy/rwa_token-keypair.json

# Check program logs
solana logs --provider.cluster devnet

# Start frontend dev server
cd app && npm run dev
```

## Current Status

- [ ] Initialize Anchor project
- [ ] Define token mint & metadata
- [ ] Create tokenization instruction
- [ ] Create investment instruction
- [ ] Revenue distribution logic
- [ ] Frontend: connect wallet + invest flow
- [ ] Tests: full coverage
- [ ] Deploy to devnet
- [ ] Hackathon submission (May 4–11)
