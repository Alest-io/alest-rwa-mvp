import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletConnect } from "./components/WalletConnect";
import { AssetCard } from "./components/AssetCard";
import { InvestForm } from "./components/InvestForm";
import { Portfolio } from "./components/Portfolio";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

const NETWORK = import.meta.env.VITE_NETWORK || "devnet";

export default function App() {
  const endpoint = useMemo(
    () => import.meta.env.VITE_RPC_URL || clusterApiUrl(NETWORK as any),
    []
  );

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <header className="border-b border-gray-800 px-6 py-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    alest.io
                  </h1>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {NETWORK}
                  </span>
                </div>
                <WalletConnect />
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-10">
              {/* Hero */}
              <section className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">
                  Invierte en activos productivos reales
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Tokenizamos activos del mundo real en Solana. Compra fracciones
                  de un Tesla Robotaxi y recibe ingresos proporcionales.
                </p>
              </section>

              {/* Asset + Invest */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <AssetCard />
                <InvestForm />
              </div>

              {/* Portfolio */}
              <Portfolio />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 px-6 py-6 text-center text-gray-500 text-sm">
              <p>
                alest.io — Democratizando la inversión en activos productivos
              </p>
              <p className="mt-1">
                <a href="https://alest.io" className="text-purple-400 hover:underline">
                  alest.io
                </a>
                {" · "}
                <a href="https://github.com/Alest-io" className="text-purple-400 hover:underline">
                  GitHub
                </a>
              </p>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
