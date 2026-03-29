# Frontend App — Local Context

## Purpose
React application for investors to connect wallets, purchase RWA tokens, and view their portfolio.

## Key Patterns

### Wallet Connection
```typescript
import { useWallet } from '@solana/wallet-adapter-react';
const { publicKey, connected, sendTransaction } = useWallet();
```

### Program Interaction
```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { RwaToken } from '../target/types/rwa_token';
```

### Environment Variables
```
VITE_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=<your_program_id>
VITE_NETWORK=devnet
```

## UX Requirements

- **Bilingual**: Spanish (primary) + English toggle
- **Mobile-first**: Most users are on phones
- **Clear feedback**: Loading spinners, success/error toasts
- **Explorer links**: Every transaction links to Solana Explorer
- **Minimum friction**: Connect wallet → choose amount → confirm → done

## Common Mistakes to Avoid

- Forgetting to handle wallet disconnection mid-transaction
- Not showing enough decimals for SOL amounts
- Hardcoding cluster URLs (use env vars)
- Not wrapping app in `WalletProvider` and `ConnectionProvider`
