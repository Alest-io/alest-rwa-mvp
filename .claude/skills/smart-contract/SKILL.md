# Skill: Solana Smart Contract Development

## When to Use
When writing, modifying, or reviewing Anchor/Solana program code in `programs/`.

## Context
- Framework: Anchor (Rust)
- Token standard: SPL Token-2022
- All programs live in `programs/rwa-token/src/`

## Rules

### Account Validation
- ALWAYS use Anchor account constraints (`#[account(has_one, constraint, seeds)]`)
- NEVER trust client-provided account data without validation
- ALWAYS derive PDAs on-chain — never accept PDA addresses from clients
- Use `init_if_needed` sparingly — prefer explicit `initialize` instructions

### Error Handling
- Define custom errors in a dedicated `errors.rs` module
- Use `require!()` macro for validation checks
- Provide descriptive error messages for debugging

### Token Operations
- Use CPI (Cross-Program Invocation) for all SPL Token interactions
- Always check token account ownership before transfers
- Handle decimals consistently (default: 6 decimals for USDC compatibility)

### Code Organization
```
programs/rwa-token/src/
├── lib.rs              ← Program entry point, instruction handlers
├── state.rs            ← Account structs (AssetVault, InvestorAccount, etc.)
├── instructions/       ← One file per instruction
│   ├── initialize.rs
│   ├── invest.rs
│   ├── distribute.rs
│   └── withdraw.rs
├── errors.rs           ← Custom error codes
└── constants.rs        ← Seeds, limits, fixed values
```

### Testing
- Write a test for every instruction BEFORE implementing it
- Test both success and failure cases
- Test edge cases: zero amount, max amount, unauthorized caller
- Use `anchor test` — never skip

### Security Checklist
- [ ] All signers validated
- [ ] PDA seeds are unique and collision-resistant
- [ ] No integer overflow (use checked_math or checked_add/sub/mul)
- [ ] Rent exemption handled
- [ ] Close account instructions clean up properly
- [ ] Admin-only functions verify authority
