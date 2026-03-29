# ADR-002: Token Economics Design

## Status: Accepted

## Date: 2026-03-28

## Context

Define how the Tesla robotaxi asset is tokenized and how revenue flows.

## Decision

### Tokenization Model

- Asset value: ~$40,000 USD
- Total supply: 40,000 tokens
- Token price: $1.00 USD per token
- Token standard: SPL Token-2022

### Distribution

| Pool | % | Tokens | Purpose |
|------|---|--------|---------|
| Investor | 70% | 28,000 | Public sale |
| Platform | 20% | 8,000 | alest.io operations & growth |
| Reserve | 10% | 4,000 | Emergencies, liquidity buffer |

### Revenue Streams

1. **Transport income** — Fares from robotaxi rides
2. **Vehicle advertising** — Display ads on the vehicle
3. **Asset appreciation** — Value increase over time

### Distribution Mechanics

- Revenue accumulates in an on-chain RevenuePool
- Admin triggers distribution (initially manual, later automated via cron/clockwork)
- Each holder receives: `(user_tokens / total_supply) * revenue_amount`
- Minimum distribution threshold: $10 USD equivalent (to avoid dust transactions)

### Investment Limits

- Minimum investment: $50 USD (~50 tokens)
- Maximum per investor: 5,000 tokens (12.5% of investor pool) — prevents concentration

## Consequences

- Need oracle or off-chain feed for USD/SOL conversion
- Revenue distribution gas costs paid by platform
- Must track all token holders for proportional distribution
