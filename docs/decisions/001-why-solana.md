# ADR-001: Choosing Solana for RWA Tokenization

## Status: Accepted

## Date: 2026-03-28

## Context

We need a blockchain for tokenizing real-world assets (starting with a Tesla robotaxi).
Requirements: low fees, fast finality, strong ecosystem, SPL token support, hackathon alignment.

## Options Considered

1. **Ethereum** — Mature ecosystem, high fees, slow finality
2. **Polygon** — Lower fees, EVM-compatible, less DeFi liquidity
3. **Solana** — Sub-cent fees, ~400ms finality, growing RWA ecosystem
4. **Base** — L2, growing fast, but less RWA tooling

## Decision

**Solana**, because:

- Transaction fees < $0.01 (critical for micro-investments of $50–$100)
- ~400ms finality enables real-time investment confirmation
- SPL Token-2022 supports transfer hooks and metadata extensions (useful for RWA compliance)
- Solana Frontier Hackathon is our launch vehicle
- Strong wallet ecosystem (Phantom, already configured as @AlestIo)
- Growing RWA projects on Solana (Maple, Credix, Parcl)

## Consequences

- Smart contracts must be written in Rust (Anchor framework reduces boilerplate)
- Frontend needs Solana Wallet Adapter integration
- Must handle Solana-specific patterns: PDAs, CPIs, rent exemption
- Team needs Rust/Anchor proficiency (or AI-assisted development via Claude Code)
