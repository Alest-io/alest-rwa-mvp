# 🚀 Alest.io — Real-World Asset Tokenization on Solana

> Democratizing investment in productive physical assets through tokenization.

[![Built on Solana](https://img.shields.io/badge/Built%20on-Solana-blueviolet)](https://solana.com)
[![Solana Frontier Hackathon](https://img.shields.io/badge/Hackathon-Solana%20Frontier%202026-green)](https://www.colosseum.org/)

## 🎯 What is Alest.io?

Alest.io is a platform that tokenizes productive real-world assets on Solana, starting with a **Tesla robotaxi pilot**. Anyone can invest in fractional ownership of physical assets and receive proportional revenue distributions.

**"alest" is an anagram of "Tesla"** — symbolizing our mission to make productive assets accessible to everyone.

## 💡 How It Works

1. **Asset Tokenization** — A real-world asset (e.g., Tesla robotaxi worth ~$40,000) is tokenized into 40,000 SPL tokens at $1 each
2. **Fractional Investment** — Users purchase tokens starting from ~$50, gaining fractional ownership
3. **Revenue Distribution** — Income from transport, advertising, and asset appreciation flows proportionally to token holders
4. **On-Chain Transparency** — All transactions, distributions, and asset data live on Solana

## 🏗️ Architecture

- **Solana Program** (Anchor/Rust) — Token minting, investment logic, revenue distribution
- **React Frontend** — Wallet connection, investment UI, portfolio dashboard
- **SPL Token-2022** — Enhanced token features for RWA compliance

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build Solana program
anchor build

# Run tests
anchor test

# Start frontend
cd app && npm run dev
```

## 📊 Token Distribution

| Allocation | Percentage | Tokens |
|-----------|-----------|--------|
| Investors (public) | 70% | 28,000 |
| Platform (alest.io) | 20% | 8,000 |
| Reserve fund | 10% | 4,000 |

## 🌎 Target Markets

- Latin Americans in the US seeking investment opportunities
- Gig economy workers looking for passive income
- Crypto-native RWA investors

## 🔗 Links

- **Website:** [alest.io](https://alest.io)
- **ENS:** alest.eth
- **Phantom:** @AlestIo
- **GitHub:** [Alest-io](https://github.com/Alest-io)

## 📄 License

MIT
