# RWA Token Program — Local Context

## ⚠️ DANGER ZONE

This is the core Solana smart contract. Bugs here lose real money.

## Critical Rules

1. **Every instruction must validate ALL accounts** — use Anchor constraints
2. **Never use `unchecked` math** — always `checked_add`, `checked_sub`, `checked_mul`
3. **PDA seeds must be deterministic** — document them in `constants.rs`
4. **Token transfers require CPI** — never manipulate lamports directly
5. **Test BEFORE commit** — `anchor build && anchor test`

## Account Structure

- `AssetVault` — Holds asset metadata (name, value, token mint, admin, status)
- `InvestorAccount` — Per-user: tokens held, revenue claimed, investment date
- `RevenuePool` — Accumulated revenue awaiting distribution

## PDA Seeds Reference

| Account | Seeds |
|---------|-------|
| AssetVault | `["asset", asset_id.as_bytes()]` |
| InvestorAccount | `["investor", asset_vault.key(), user.key()]` |
| RevenuePool | `["revenue", asset_vault.key()]` |

## Known Complexity

- Revenue distribution must iterate over all investors — may hit compute limits
  - Solution: paginated distribution (batch of N investors per tx)
- Token-2022 CPI calls differ from legacy SPL Token — check import paths
- Rent exemption: all PDAs must be rent-exempt at creation
