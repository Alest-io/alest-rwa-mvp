import React from "react";

export function AssetCard() {
  // TODO: Fetch from on-chain AssetVault account
  const asset = {
    name: "Tesla Robotaxi #001",
    totalValue: 40_000,
    tokenPrice: 1.0,
    totalSupply: 40_000,
    tokensAvailable: 28_000, // 70% investor pool
    status: "Activo",
    revenueStreams: ["Transporte", "Publicidad", "Apreciación"],
  };

  const soldPercentage =
    ((asset.tokensAvailable - asset.tokensAvailable) / asset.tokensAvailable) * 100;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{asset.name}</h3>
        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
          {asset.status}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Valor del activo</span>
          <span className="font-medium">${asset.totalValue.toLocaleString()} USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Precio por token</span>
          <span className="font-medium">${asset.tokenPrice.toFixed(2)} USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Tokens disponibles</span>
          <span className="font-medium">
            {asset.tokensAvailable.toLocaleString()} / {asset.totalSupply.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{soldPercentage.toFixed(1)}% vendido</p>
        </div>

        {/* Revenue streams */}
        <div className="mt-4">
          <p className="text-gray-400 text-xs mb-2">Fuentes de ingreso</p>
          <div className="flex gap-2">
            {asset.revenueStreams.map((stream) => (
              <span
                key={stream}
                className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
              >
                {stream}
              </span>
            ))}
          </div>
        </div>

        {/* Token distribution */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-gray-400 text-xs mb-2">Distribución de tokens</p>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-purple-400">70%</span>{" "}
              <span className="text-gray-500">Inversores</span>
            </div>
            <div>
              <span className="text-cyan-400">20%</span>{" "}
              <span className="text-gray-500">Plataforma</span>
            </div>
            <div>
              <span className="text-yellow-400">10%</span>{" "}
              <span className="text-gray-500">Reserva</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
