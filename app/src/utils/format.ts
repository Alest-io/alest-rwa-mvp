import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import BN from 'bn.js'

export const LAMPORTS = LAMPORTS_PER_SOL  // 1_000_000_000

export function lamportsToSOL(lamports: BN | number): number {
  const n = lamports instanceof BN ? lamports.toNumber() : lamports
  return n / LAMPORTS
}

export function formatSOL(lamports: BN | number, decimals = 4): string {
  return `${lamportsToSOL(lamports).toFixed(decimals)} SOL`
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatTokens(amount: BN | number): string {
  const n = amount instanceof BN ? amount.toNumber() : amount
  return new Intl.NumberFormat('en-US').format(n)
}

export function shortAddress(pubkey: string): string {
  return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`
}
