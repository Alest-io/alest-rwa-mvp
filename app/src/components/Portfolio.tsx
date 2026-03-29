import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function Portfolio() {
  const { connected, publicKey } = useWallet();

  if (!connected) return null;

  // TODO: Fetch from on-chain InvestorAccount
  const portfolio = {
    tokensHeld: 0,
    claimableRevenue: 0,
    totalClaimed: 0,
    investedAt: null as string | null,
  };

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-xl font-semibold mb-4">Mi Portafolio</h3>

      {portfolio.tokensHeld === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Aún no tienes tokens de este activo.</p>
          <p className="text-sm text-gray-600 mt-1">
            Invierte arriba para comenzar a recibir ingresos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400">Tokens</p>
            <p className="text-2xl font-bold">{portfolio.tokensHeld.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400">Propiedad</p>
            <p className="text-2xl font-bold text-purple-400">
              {((portfolio.tokensHeld / 40_000) * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400">Ingresos por reclamar</p>
            <p className="text-2xl font-bold text-green-400">
              ${portfolio.claimableRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400">Total reclamado</p>
            <p className="text-2xl font-bold text-cyan-400">
              ${portfolio.totalClaimed.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Claim button */}
      {portfolio.claimableRevenue > 0 && (
        <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition">
          Reclamar ${portfolio.claimableRevenue.toFixed(2)} USD
        </button>
      )}

      {/* Wallet info */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-600">
        Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
      </div>
    </section>
  );
}
