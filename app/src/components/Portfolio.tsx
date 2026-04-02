import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAsset } from "../hooks/useAsset";
import { useRevenue } from "../hooks/useRevenue";
import { lamportsToSOL, formatSOL } from "../utils/format";
import { getExplorerTxUrl } from "../utils/constants";

interface PortfolioProps {
  onClaimed?: () => void;
}

export function Portfolio({ onClaimed }: PortfolioProps) {
  const { connected, publicKey } = useWallet();
  const { vault, investor, claimableLamports, loading } = useAsset();
  const { withdraw, loading: withdrawing, txSig, error: withdrawError } = useRevenue();

  if (!connected) return null;

  const handleClaim = async () => {
    try {
      await withdraw();
      onClaimed?.();
    } catch {
      // error displayed via withdrawError state
    }
  };

  const claimableSOL = lamportsToSOL(claimableLamports);
  const totalClaimedSOL = investor ? lamportsToSOL(investor.totalClaimed) : 0;

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-xl font-semibold mb-4">Mi Portafolio</h3>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : !investor || investor.tokensHeld === 0 ? (
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
            <p className="text-2xl font-bold">{investor.tokensHeld.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400">Propiedad</p>
            <p className="text-2xl font-bold text-purple-400">
              {((investor.tokensHeld / 40_000) * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400">Ingresos por reclamar</p>
            <p className="text-2xl font-bold text-green-400">
              {formatSOL(claimableLamports)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400">Total reclamado</p>
            <p className="text-2xl font-bold text-cyan-400">
              {formatSOL(investor.totalClaimed)}
            </p>
          </div>
        </div>
      )}

      {/* Claim button */}
      {investor && claimableSOL > 0 && (
        <button
          onClick={handleClaim}
          disabled={withdrawing}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
        >
          {withdrawing ? "Procesando..." : `Reclamar ${formatSOL(claimableLamports)}`}
        </button>
      )}

      {/* Claim success */}
      {txSig && (
        <div className="mt-3 text-sm text-green-400 bg-green-900/30 p-3 rounded-lg">
          ✅ ¡Ingresos reclamados!{" "}
          <a
            href={getExplorerTxUrl(txSig)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-cyan-400"
          >
            Ver en Explorer
          </a>
        </div>
      )}

      {/* Claim error */}
      {withdrawError && (
        <div className="mt-3 text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">
          ❌ {withdrawError}
        </div>
      )}

      {/* Wallet info */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-600">
        Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
      </div>
    </section>
  );
}
