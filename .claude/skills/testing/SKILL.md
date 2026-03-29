# Skill: Testing Solana Programs

## When to Use
When writing or running tests for the RWA token program.

## Test Framework
- Anchor's built-in test runner (Mocha + TypeScript)
- Tests in `tests/` directory
- Run with `anchor test`

## Test Structure

```typescript
describe("rwa-token", () => {
  // Setup: provider, program, keypairs
  
  describe("initialize_asset", () => {
    it("creates asset with correct metadata", async () => { ... });
    it("fails with zero total supply", async () => { ... });
    it("fails when non-admin calls", async () => { ... });
  });

  describe("invest", () => {
    it("transfers tokens to investor", async () => { ... });
    it("fails below minimum investment", async () => { ... });
    it("fails above maximum per investor", async () => { ... });
    it("fails when pool is empty", async () => { ... });
  });

  // ... etc
});
```

## Rules

- Test HAPPY PATH first, then error cases
- Always assert on-chain state changes (account data, token balances)
- Use `anchor.web3.Keypair.generate()` for test wallets
- Airdrop SOL to test wallets before each test suite
- Clean error messages: `assert.fail("Expected error: insufficient funds")`
- NEVER skip a failing test — fix it or document why

## Common Patterns

### Assert Account Data
```typescript
const account = await program.account.assetVault.fetch(assetPDA);
assert.equal(account.totalSupply.toNumber(), 40000);
```

### Assert Error
```typescript
try {
  await program.methods.invest(amount).accounts({...}).rpc();
  assert.fail("Should have thrown");
} catch (err) {
  assert.include(err.message, "InsufficientFunds");
}
```

### PDA Derivation in Tests
```typescript
const [assetPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("asset"), assetId.toBuffer()],
  program.programId
);
```
