import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useInvest } from "../hooks/useInvest";
import { VaultData } from "../hooks/useAsset";
import { getExplorerTxUrl } from "../utils/constants";

const MIN_TOKENS = 50;
const MAX_TOKENS = 5_000;
const TOKEN_PRICE_USD = 1.0;

interface InvestFormProps {
  vault: VaultData | null;
  onSuccess?: () => void;
}

export function InvestForm({ vault, onSuccess }: InvestFormProps) {
  const { connected, publicKey } = useWallet();
  const { invest, loading, txSig, error: investError } = useInvest(vault);
  const [amount, setAmount] = useState<number>(MIN_TOKENS);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalCost = amount * TOKEN_PRICE_USD;

  const handleInvest = async () => {
    if (!connected || !publicKey) return;
    setStatus("idle");
    setErrorMsg(null);

    try {
      await invest(amount);
      setStatus("success");
      onSuccess?.();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Error al procesar la inversión");
    }
  };

  if (!connected) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Conecta tu wallet para invertir</p>
          <p className="text-xs text-gray-600">
            Compatible con Phantom, Solflare, Backpack
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-xl font-semibold mb-4">Invertir</h3>

      {/* Amount input */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 block mb-2">
          Cantidad de tokens
        </label>
        <input
          type="range"
          min={MIN_TOKENS}
          max={MAX_TOKENS}
          step={10}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{MIN_TOKENS} mín</span>
          <span className="text-lg text-white font-bold">{amount.toLocaleString()}</span>
          <span>{MAX_TOKENS.toLocaleString()} máx</span>
        </div>
      </div>

      {/* Cost summary */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Tokens</span>
          <span>{amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Precio por token</span>
          <span>${TOKEN_PRICE_USD.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-700 pt-2">
          <span className="text-gray-400 font-medium">Total</span>
          <span className="text-lg font-bold text-purple-400">
            ${totalCost.toLocaleString()} USD
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Propiedad</span>
          <span className="text-cyan-400">
            {((amount / 40_000) * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Invest button */}
      <button
        onClick={handleInvest}
        disabled={loading || !vault}
        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
      >
        {loading ? "Procesando..." : `Invertir $${totalCost.toLocaleString()} USD`}
      </button>

      {/* Status messages */}
      {status === "success" && txSig && (
        <div className="mt-3 text-sm text-green-400 bg-green-900/30 p-3 rounded-lg">
          ✅ ¡Inversión exitosa! Tus tokens han sido transferidos.{" "}
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
      {status === "success" && !txSig && (
        <div className="mt-3 text-sm text-green-400 bg-green-900/30 p-3 rounded-lg">
          ✅ ¡Inversión exitosa! Tus tokens han sido transferidos.
        </div>
      )}
      {status === "error" && (
        <div className="mt-3 text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">
          ❌ {errorMsg || investError || "Error al procesar la inversión. Intenta de nuevo."}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-600 mt-4">
        Al invertir, aceptas que los activos tokenizados conllevan riesgo.
        Los rendimientos pasados no garantizan resultados futuros.
      </p>
    </div>
  );
}
