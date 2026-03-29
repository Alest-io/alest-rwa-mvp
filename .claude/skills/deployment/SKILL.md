# Skill: Deployment

## When to Use
When deploying the program to devnet/mainnet or the frontend to production.

## Pre-deployment

1. ALL tests must pass: `anchor test`
2. Build must succeed: `anchor build`
3. Verify program ID matches in `Anchor.toml` and `lib.rs`
4. Check wallet has sufficient SOL

## Deploy Program

```bash
# Devnet
anchor deploy --provider.cluster devnet

# Mainnet (CAREFUL)
anchor deploy --provider.cluster mainnet-beta
```

## Deploy Frontend

```bash
cd app
npm run build
# Deploy to Vercel/Netlify/AWS
```

## Post-deployment Verification

- [ ] Program is visible on Solana Explorer
- [ ] `initialize_asset` works
- [ ] Frontend connects to correct cluster
- [ ] Wallet adapter connects successfully
- [ ] Test investment of minimum amount works

## NEVER

- Deploy to mainnet without team review
- Use devnet keypairs on mainnet
- Deploy with hardcoded RPC endpoints
- Skip the verification checklist
