export const ASSET_NAME = "tesla-robotaxi-001";
export const TOTAL_SUPPLY = 40_000;
export const TOKEN_PRICE_USD = 1.0;
export const MIN_INVESTMENT_TOKENS = 50;
export const MAX_INVESTMENT_TOKENS = 5_000;

// Distribution percentages
export const INVESTOR_POOL_PERCENT = 70;
export const PLATFORM_POOL_PERCENT = 20;
export const RESERVE_POOL_PERCENT = 10;

// Network
export const NETWORK = import.meta.env.VITE_NETWORK || "devnet";
export const EXPLORER_BASE =
  NETWORK === "mainnet-beta"
    ? "https://explorer.solana.com"
    : `https://explorer.solana.com/?cluster=${NETWORK}`;

/**
 * Get Solana Explorer URL for a transaction
 */
export function getExplorerTxUrl(txId: string): string {
  const cluster = NETWORK === "mainnet-beta" ? "" : `?cluster=${NETWORK}`;
  return `https://explorer.solana.com/tx/${txId}${cluster}`;
}
