# Hook: Auto-test on Program Changes

## Trigger
After any edit to files in `programs/rwa-token/src/`

## Action
```bash
anchor build && anchor test
```

## Purpose
Prevents deploying broken smart contract code.
Every change to the Solana program MUST pass tests before proceeding.

## If Tests Fail
- STOP current task
- Fix the failing test or revert the change
- Do NOT continue with other tasks until tests pass
