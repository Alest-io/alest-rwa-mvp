import { useState } from 'react'
import { useProgram, getAssetVaultPDA, getInvestorPDA, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '../utils/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { SystemProgram, PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { ASSET_NAME } from '../utils/constants'

export function useInvest(vault: { tokenMint: string; investorPoolTokenAccount: string; address: string } | null) {
  const program = useProgram()
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [txSig, setTxSig] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const invest = async (tokenAmount: number) => {
    if (!program || !publicKey || !vault) throw new Error('Wallet not connected')
    setLoading(true)
    setError(null)
    setTxSig(null)
    try {
      const [vaultPDA] = getAssetVaultPDA(ASSET_NAME)
      const [investorAccountPDA] = getInvestorPDA(vaultPDA, publicKey)
      const tokenMint = new PublicKey(vault.tokenMint)
      const investorPoolTokenAccount = new PublicKey(vault.investorPoolTokenAccount)
      const investorTokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey)

      const sig = await (program.methods as any)
        .invest(new BN(tokenAmount))
        .accounts({
          investor: publicKey,
          assetVault: vaultPDA,
          investorAccount: investorAccountPDA,
          investorPoolTokenAccount,
          tokenMint,
          investorTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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

  return { invest, loading, txSig, error }
}
