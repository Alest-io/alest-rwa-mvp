import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Connection } from '@solana/web3.js'
import { useMemo } from 'react'
import { IDL } from './idl'

export const PROGRAM_ID = new PublicKey('BLiqwdcVRPVT7Z4UjVkCaRzcK8Ui91s3edtZz94YWJf8')
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
export const REVENUE_SCALE = 1_000_000

// Derive ATAs manually (avoids needing @solana/spl-token)
export function getAssociatedTokenAddressSync(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  return address
}

export function getAssetVaultPDA(assetName: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('asset'), Buffer.from(assetName)],
    PROGRAM_ID
  )
}

export function getInvestorPDA(assetVault: PublicKey, user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('investor'), assetVault.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  )
}

// Read-only program (no wallet needed for fetching accounts)
export function getReadProgram(connection: Connection) {
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any) => txs,
  }
  const provider = new AnchorProvider(connection, dummyWallet as any, { commitment: 'confirmed' })
  return new Program(IDL as any, provider)
}

// Hook: returns program with connected wallet (or null if not connected)
export function useProgram() {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()
  return useMemo(() => {
    if (!wallet) return null
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
    return new Program(IDL as any, provider)
  }, [connection, wallet])
}
