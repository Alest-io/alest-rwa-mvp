import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RwaToken } from "../target/types/rwa_token";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("rwa-token", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RwaToken as Program<RwaToken>;
  const admin = provider.wallet;

  // Test constants
  const ASSET_NAME = "tesla-robotaxi-001";
  const TOTAL_SUPPLY = 40_000;
  const TOKEN_PRICE_LAMPORTS = 7_000_000; // ~$1 USD in lamports (approximate)
  const MIN_INVESTMENT = 50; // 50 tokens = ~$50
  const MAX_INVESTMENT = 5_000; // 5000 tokens = 12.5% of investor pool

  // PDAs
  let assetVaultPDA: PublicKey;
  let assetVaultBump: number;

  before(async () => {
    // Derive PDAs
    [assetVaultPDA, assetVaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset"), Buffer.from(ASSET_NAME)],
      program.programId
    );
  });

  // ============================================================
  // initialize_asset
  // ============================================================

  describe("initialize_asset", () => {
    it("creates asset vault with correct metadata", async () => {
      const tx = await program.methods
        .initializeAsset(ASSET_NAME, new anchor.BN(TOTAL_SUPPLY), new anchor.BN(TOKEN_PRICE_LAMPORTS))
        .accounts({
          admin: admin.publicKey,
          assetVault: assetVaultPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("  Initialize tx:", tx);

      // Fetch and verify account data
      const vault = await program.account.assetVault.fetch(assetVaultPDA);
      assert.equal(vault.assetName, ASSET_NAME);
      assert.equal(vault.totalSupply.toNumber(), TOTAL_SUPPLY);
      assert.equal(vault.tokenPrice.toNumber(), TOKEN_PRICE_LAMPORTS);
      assert.equal(vault.admin.toBase58(), admin.publicKey.toBase58());
    });

    it("fails when called with empty asset name", async () => {
      const [emptyPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("asset"), Buffer.from("")],
        program.programId
      );

      try {
        await program.methods
          .initializeAsset("", new anchor.BN(TOTAL_SUPPLY), new anchor.BN(TOKEN_PRICE_LAMPORTS))
          .accounts({
            admin: admin.publicKey,
            assetVault: emptyPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        // Expected to fail
        assert.ok(err);
      }
    });

    it("fails when called with zero total supply", async () => {
      const [zeroPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("asset"), Buffer.from("zero-test")],
        program.programId
      );

      try {
        await program.methods
          .initializeAsset("zero-test", new anchor.BN(0), new anchor.BN(TOKEN_PRICE_LAMPORTS))
          .accounts({
            admin: admin.publicKey,
            assetVault: zeroPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(err);
      }
    });
  });

  // ============================================================
  // invest
  // ============================================================

  describe("invest", () => {
    const investor = Keypair.generate();

    before(async () => {
      // Airdrop SOL to test investor
      const sig = await provider.connection.requestAirdrop(
        investor.publicKey,
        5 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    });

    it("allows investment of valid amount", async () => {
      // TODO: Implement once invest instruction is complete
      // const tx = await program.methods
      //   .invest(new anchor.BN(100)) // 100 tokens
      //   .accounts({
      //     investor: investor.publicKey,
      //     assetVault: assetVaultPDA,
      //     systemProgram: anchor.web3.SystemProgram.programId,
      //   })
      //   .signers([investor])
      //   .rpc();
      //
      // const investorAccount = await program.account.investorAccount.fetch(investorPDA);
      // assert.equal(investorAccount.tokensHeld.toNumber(), 100);
    });

    it("rejects investment below minimum", async () => {
      // TODO: Implement
      // try {
      //   await program.methods
      //     .invest(new anchor.BN(10)) // Below minimum of 50
      //     .accounts({...})
      //     .signers([investor])
      //     .rpc();
      //   assert.fail("Should have thrown InvestmentTooSmall");
      // } catch (err) {
      //   assert.include(err.message, "InvestmentTooSmall");
      // }
    });

    it("rejects investment above maximum per investor", async () => {
      // TODO: Implement
    });

    it("rejects investment when pool is exhausted", async () => {
      // TODO: Implement
    });
  });

  // ============================================================
  // distribute_revenue
  // ============================================================

  describe("distribute_revenue", () => {
    it("distributes revenue proportionally", async () => {
      // TODO: Implement once distribute instruction is complete
    });

    it("fails when non-admin calls", async () => {
      const fakeAdmin = Keypair.generate();
      const sig = await provider.connection.requestAirdrop(
        fakeAdmin.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);

      // TODO: Verify unauthorized access is blocked
      // try {
      //   await program.methods
      //     .distributeRevenue(new anchor.BN(1_000_000))
      //     .accounts({
      //       admin: fakeAdmin.publicKey,
      //       assetVault: assetVaultPDA,
      //       systemProgram: anchor.web3.SystemProgram.programId,
      //     })
      //     .signers([fakeAdmin])
      //     .rpc();
      //   assert.fail("Should have thrown Unauthorized");
      // } catch (err) {
      //   assert.include(err.message, "Unauthorized");
      // }
    });
  });

  // ============================================================
  // withdraw
  // ============================================================

  describe("withdraw", () => {
    it("allows investor to claim revenue", async () => {
      // TODO: Implement
    });

    it("fails when nothing to claim", async () => {
      // TODO: Implement
    });
  });
});
