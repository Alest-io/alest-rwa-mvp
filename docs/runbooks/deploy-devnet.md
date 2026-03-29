# Runbook: Deploy to Devnet

## Pre-deployment Checklist

- [ ] All tests pass (`anchor test`)
- [ ] Program builds without warnings (`anchor build`)
- [ ] Anchor.toml has correct cluster and wallet config
- [ ] Sufficient SOL in deployer wallet (at least 5 SOL for devnet)

## Steps

### 1. Airdrop SOL (devnet only)
```bash
solana airdrop 5 --url devnet
```

### 2. Build
```bash
anchor build
```

### 3. Get Program ID
```bash
solana address -k target/deploy/rwa_token-keypair.json
```
Update `Anchor.toml` and `lib.rs` with the program ID.

### 4. Deploy
```bash
anchor deploy --provider.cluster devnet
```

### 5. Verify
```bash
solana program show <PROGRAM_ID> --url devnet
```

### 6. Initialize Asset (first time only)
```bash
npx ts-node scripts/initialize-asset.ts
```

## Rollback

If deployment fails:
1. Check `solana logs` for errors
2. If program is broken, redeploy with `anchor deploy --provider.cluster devnet`
3. Program data is upgradeable by default — no need to change program ID

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Insufficient funds" | `solana airdrop 5 --url devnet` |
| "Program already deployed" | Use `anchor upgrade` instead |
| "Account not found" | Ensure PDA seeds match between client and program |
| Build fails | Check Rust version: `rustup update && cargo install --force anchor-cli` |
