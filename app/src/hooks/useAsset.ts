import { useEffect, useState, useCallback } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from '@solana/wallet-adapter-react'
import BN from 'bn.js'
import { getReadProgram, getAssetVaultPDA, getInvestorPDA } from '../utils/anchor'
import { ASSET_NAME } from '../utils/constants'

export interface VaultData {
  address: string
  assetName: string
  totalSupply: number
  tokenPrice: BN
  tokenMint: string
  investorPoolTokenAccount: string
  investorPoolRemaining: number
  totalRevenueDistributed: BN
  revenuePerTokenScaled: BN
  status: number
}

export interface InvestorData {
  tokensHeld: number
  revenueDebt: BN
  totalClaimed: BN
  investedAt: number
}

export function useAsset() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [vault, setVault] = useState<VaultData | null>(null)
  const [investor, setInvestor] = useState<InvestorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVault = useCallback(async () => {
    try {
      const program = getReadProgram(connection)
      const [vaultPDA] = getAssetVaultPDA(ASSET_NAME)
      const data = await (program.account as any).assetVault.fetch(vaultPDA)
      setVault({
        address: vaultPDA.toBase58(),
        assetName: data.assetName,
        totalSupply: data.totalSupply.toNumber(),
        tokenPrice: data.tokenPrice,
        tokenMint: data.tokenMint.toBase58(),
        investorPoolTokenAccount: data.investorPoolTokenAccount.toBase58(),
        investorPoolRemaining: data.investorPoolRemaining.toNumber(),
        totalRevenueDistributed: data.totalRevenueDistributed,
        revenuePerTokenScaled: data.revenuePerTokenScaled,
        status: data.status,
      })
      setError(null)
    } catch (e: any) {
      // Vault may not be initialized yet on devnet
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [connection])

  const fetchInvestor = useCallback(async () => {
    if (!publicKey || !vault) { setInvestor(null); return }
    try {
      const program = getReadProgram(connection)
      const [vaultPDA] = getAssetVaultPDA(ASSET_NAME)
      const [investorPDA] = getInvestorPDA(vaultPDA, publicKey)
      const data = await (program.account as any).investorAccount.fetch(investorPDA)
      setInvestor({
        tokensHeld: data.tokensHeld.toNumber(),
        revenueDebt: data.revenueDebt,
        totalClaimed: data.totalClaimed,
        investedAt: data.investedAt.toNumber(),
      })
    } catch {
      setInvestor(null)
    }
  }, [connection, publicKey, vault])

  useEffect(() => {
    fetchVault()
    const id = setInterval(fetchVault, 15_000)
    return () => clearInterval(id)
  }, [fetchVault])

  useEffect(() => { fetchInvestor() }, [fetchInvestor])

  // Calculate claimable lamports from on-chain state
  const claimableLamports = (() => {
    if (!vault || !investor) return new BN(0)
    const SCALE = new BN(1_000_000)
    const delta = vault.revenuePerTokenScaled.sub(investor.revenueDebt)
    if (delta.lten(0)) return new BN(0)
    return delta.mul(new BN(investor.tokensHeld)).div(SCALE)
  })()

  return { vault, investor, claimableLamports, loading, error, refresh: fetchVault }
}
