import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { shortAddress } from '../utils/format'

export function WalletConnect() {
  const { publicKey, connected } = useWallet()

  return (
    <div className="flex items-center gap-3">
      {connected && publicKey && (
        <span className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-[#0d1526] border border-[#1e3a6e]/50 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {shortAddress(publicKey.toBase58())}
        </span>
      )}
      <WalletMultiButton
        style={{
          background: connected ? '#0d1526' : '#1d4ed8',
          border: `1px solid ${connected ? 'rgba(30,58,110,0.5)' : '#3b82f6'}`,
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          height: '40px',
          padding: '0 16px',
          transition: 'all 0.2s ease',
        }}
      />
    </div>
  )
}
