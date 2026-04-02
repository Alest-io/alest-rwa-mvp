import React from 'react'
import { VaultData } from '../hooks/useAsset'
import { formatTokens, shortAddress } from '../utils/format'
import { TOTAL_SUPPLY } from '../utils/constants'

interface AssetCardProps {
  vault: VaultData | null
  loading?: boolean
}

export function AssetCard({ vault, loading }: AssetCardProps) {
  const totalInvestorPool = Math.floor(TOTAL_SUPPLY * 0.7) // 28,000
  const remaining = vault ? vault.investorPoolRemaining : totalInvestorPool
  const sold = totalInvestorPool - remaining
  const soldPercent = totalInvestorPool > 0 ? (sold / totalInvestorPool) * 100 : 0

  return (
    <div className="bg-[#0d1526] border border-[#1e3a6e]/50 rounded-2xl p-6 shadow-lg shadow-blue-500/10 flex flex-col gap-5">
      {/* Car visual */}
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-xl py-8 border border-[#1e3a6e]/30">
        <div className="text-center">
          <svg viewBox="0 0 120 60" className="w-36 h-auto mx-auto mb-2" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Car body */}
            <rect x="10" y="28" width="100" height="22" rx="5" fill="#0ea5e9" opacity="0.9"/>
            {/* Car roof */}
            <path d="M30 28 L40 12 L80 12 L90 28Z" fill="#0284c7" opacity="0.95"/>
            {/* Windshield */}
            <path d="M42 14 L48 28 L72 28 L78 14Z" fill="#e0f2fe" opacity="0.4"/>
            {/* Left window */}
            <rect x="34" y="15" width="12" height="11" rx="2" fill="#e0f2fe" opacity="0.35"/>
            {/* Right window */}
            <rect x="74" y="15" width="12" height="11" rx="2" fill="#e0f2fe" opacity="0.35"/>
            {/* Front wheel */}
            <circle cx="28" cy="50" r="9" fill="#1e293b" stroke="#38bdf8" strokeWidth="2"/>
            <circle cx="28" cy="50" r="4" fill="#38bdf8" opacity="0.7"/>
            {/* Rear wheel */}
            <circle cx="92" cy="50" r="9" fill="#1e293b" stroke="#38bdf8" strokeWidth="2"/>
            <circle cx="92" cy="50" r="4" fill="#38bdf8" opacity="0.7"/>
            {/* Headlight */}
            <rect x="106" y="32" width="6" height="4" rx="2" fill="#fde68a" opacity="0.9"/>
            {/* Taillight */}
            <rect x="8" y="32" width="6" height="4" rx="2" fill="#f87171" opacity="0.9"/>
            {/* Tesla logo area */}
            <circle cx="60" cy="38" r="4" fill="#e0f2fe" opacity="0.5"/>
          </svg>
          <p className="text-blue-400 font-bold text-sm tracking-wide">TESLA ROBOTAXI FSD</p>
          <p className="text-slate-500 text-xs mt-0.5">Vehículo autónomo tokenizado</p>
        </div>
      </div>

      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-xl">Tesla Robotaxi FSD</h3>
          <p className="text-slate-400 text-sm mt-0.5">Activo de transporte productivo</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {vault?.status === 1 ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Activo
            </span>
          ) : (
            <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-1 rounded-full">
              Pendiente
            </span>
          )}
          <span className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
            Solana Devnet
          </span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#080d1a] rounded-xl p-3 border border-[#1e3a6e]/30">
          <p className="text-slate-400 text-xs mb-1">Valor total del activo</p>
          <p className="text-white font-bold text-lg">$40,000 USD</p>
        </div>
        <div className="bg-[#080d1a] rounded-xl p-3 border border-[#1e3a6e]/30">
          <p className="text-slate-400 text-xs mb-1">Precio por token</p>
          <p className="text-cyan-400 font-bold text-lg">$1.00 USD</p>
        </div>
        <div className="bg-[#080d1a] rounded-xl p-3 border border-[#1e3a6e]/30">
          <p className="text-slate-400 text-xs mb-1">Supply total</p>
          <p className="text-white font-bold text-lg">40,000</p>
        </div>
        <div className="bg-[#080d1a] rounded-xl p-3 border border-[#1e3a6e]/30">
          <p className="text-slate-400 text-xs mb-1">Disponible inversores</p>
          <p className="text-blue-400 font-bold text-lg">
            {loading ? '...' : formatTokens(remaining)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Pool de inversores vendido</span>
          <span className="text-blue-400 font-semibold">{soldPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[#080d1a] rounded-full h-2.5 border border-[#1e3a6e]/30">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(soldPercent, 0)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1.5">
          <span>{formatTokens(sold)} vendidos</span>
          <span>{formatTokens(totalInvestorPool)} total pool</span>
        </div>
      </div>

      {/* Revenue sources */}
      <div>
        <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">Fuentes de ingreso</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Transporte', icon: '🚗' },
            { label: 'Publicidad', icon: '📢' },
            { label: 'Apreciación', icon: '📈' },
          ].map(({ label, icon }) => (
            <span
              key={label}
              className="text-xs text-blue-300 bg-blue-900/30 border border-blue-500/20 px-3 py-1.5 rounded-lg font-medium"
            >
              {icon} {label}
            </span>
          ))}
        </div>
      </div>

      {/* Token distribution */}
      <div className="pt-4 border-t border-[#1e3a6e]/40">
        <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">Distribución de tokens</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#080d1a] rounded-lg p-2 border border-[#1e3a6e]/20">
            <p className="text-blue-400 font-bold text-base">70%</p>
            <p className="text-slate-500 text-xs">Inversores</p>
          </div>
          <div className="bg-[#080d1a] rounded-lg p-2 border border-[#1e3a6e]/20">
            <p className="text-cyan-400 font-bold text-base">20%</p>
            <p className="text-slate-500 text-xs">Plataforma</p>
          </div>
          <div className="bg-[#080d1a] rounded-lg p-2 border border-[#1e3a6e]/20">
            <p className="text-slate-300 font-bold text-base">10%</p>
            <p className="text-slate-500 text-xs">Reserva</p>
          </div>
        </div>
      </div>

      {/* Vault address */}
      {vault && (
        <div className="text-xs text-slate-600 truncate">
          Vault: <span className="text-slate-500 font-mono">{shortAddress(vault.address)}</span>
        </div>
      )}
    </div>
  )
}
