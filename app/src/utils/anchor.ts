import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

// TODO: Import generated IDL after first `anchor build`
// import { RwaToken, IDL } from "../../target/types/rwa_token";

const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || "11111111111111111111111111111111"
);

/**
 * Hook to get the Anchor program instance.
 * Returns null if wallet is not connected.
 */
export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    // TODO: Uncomment after first build
    // return new Program<RwaToken>(IDL, PROGRAM_ID, provider);
    return null;
  }, [connection, wallet]);
}

/**
 * Derive the AssetVault PDA for a given asset name.
 */
export function getAssetVaultPDA(assetName: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("asset"), Buffer.from(assetName)],
    PROGRAM_ID
  );
}

/**
 * Derive the InvestorAccount PDA for a given asset and user.
 */
export function getInvestorPDA(
  assetVault: PublicKey,
  user: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("investor"), assetVault.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}

export { PROGRAM_ID };
