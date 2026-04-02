import { useState } from 'react'
import { useProgram, getAssetVaultPDA, getInvestorPDA } from '../utils/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { SystemProgram } from '@solana/web3.js'
import { ASSET_NAME } from '../utils/constants'

export function useRevenue(vaultAddress?: string) {
  const program = useProgram()
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [txSig, setTxSig] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const withdraw = async () => {
    if (!program || !publicKey) throw new Error('Wallet not connected')
    setLoading(true)
    setError(null)
    setTxSig(null)
    try {
      const [vaultPDA] = getAssetVaultPDA(ASSET_NAME)
      const [investorAccountPDA] = getInvestorPDA(vaultPDA, publicKey)

      const sig = await (program.methods as any)
        .withdraw()
        .accounts({
          investor: publicKey,
          assetVault: vaultPDA,
          investorAccount: investorAccountPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      setTxSig(sig)
      return sig
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { withdraw, loading, txSig, error }
}
