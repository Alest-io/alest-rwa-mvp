import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RwaToken } from "../target/types/rwa_token";
import { PublicKey } from "@solana/web3.js";

/**
 * Initialize the Tesla Robotaxi asset on devnet
 * 
 * Usage: npx ts-node scripts/initialize-asset.ts
 * 
 * Prerequisites:
 * - Program deployed to devnet
 * - Wallet with sufficient SOL
 * - Anchor.toml configured for devnet
 */

async function main() {
  // Setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.RwaToken as Program<RwaToken>;

  // Asset configuration
  const ASSET_NAME = "tesla-robotaxi-001";
  const TOTAL_SUPPLY = 40_000;
  const TOKEN_PRICE_LAMPORTS = 7_000_000; // ~$1 USD

  console.log("=".repeat(60));
  console.log("  ALEST.IO — Initialize Tesla Robotaxi Asset");
  console.log("=".repeat(60));
  console.log(`  Network:      ${provider.connection.rpcEndpoint}`);
  console.log(`  Admin:        ${provider.wallet.publicKey.toBase58()}`);
  console.log(`  Asset:        ${ASSET_NAME}`);
  console.log(`  Total Supply: ${TOTAL_SUPPLY.toLocaleString()} tokens`);
  console.log(`  Token Price:  ${TOKEN_PRICE_LAMPORTS} lamports (~$1 USD)`);
  console.log("=".repeat(60));

  // Derive PDA
  const [assetVaultPDA, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("asset"), Buffer.from(ASSET_NAME)],
    program.programId
  );
  console.log(`\n  AssetVault PDA: ${assetVaultPDA.toBase58()}`);
  console.log(`  Bump: ${bump}`);

  // Check if already initialized
  try {
    const existing = await program.account.assetVault.fetch(assetVaultPDA);
    console.log("\n  ⚠️  Asset already initialized!");
    console.log(`  Status: ${existing.status}`);
    console.log(`  Investor pool remaining: ${existing.investorPoolRemaining}`);
    return;
  } catch {
    // Not initialized yet — proceed
  }

  // Initialize
  console.log("\n  Initializing asset...");
  const tx = await program.methods
    .initializeAsset(
      ASSET_NAME,
      new anchor.BN(TOTAL_SUPPLY),
      new anchor.BN(TOKEN_PRICE_LAMPORTS)
    )
    .accounts({
      admin: provider.wallet.publicKey,
      assetVault: assetVaultPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log(`  ✅ Asset initialized!`);
  console.log(`  Transaction: ${tx}`);
  console.log(`  Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

  // Verify
  const vault = await program.account.assetVault.fetch(assetVaultPDA);
  console.log(`\n  Verified on-chain:`);
  console.log(`  Asset Name: ${vault.assetName}`);
  console.log(`  Total Supply: ${vault.totalSupply.toNumber().toLocaleString()}`);
  console.log(`  Admin: ${vault.admin.toBase58()}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n  ❌ Error:", err);
    process.exit(1);
  });
