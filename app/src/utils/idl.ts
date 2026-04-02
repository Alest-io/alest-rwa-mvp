export const IDL = {
  "address": "BLiqwdcVRPVT7Z4UjVkCaRzcK8Ui91s3edtZz94YWJf8",
  "metadata": {
    "name": "rwa_token",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Real-World Asset Tokenization on Solana — alest.io"
  },
  "instructions": [
    {
      "name": "distribute_revenue",
      "docs": [
        "Distribute revenue proportionally to all token holders.",
        "",
        "Admin deposits `total_revenue` lamports into the vault.",
        "Uses a per-token accumulator so no iteration is needed — O(1) complexity.",
        "Each holder claims their share lazily when calling `withdraw`.",
        "",
        "Denominator: `total_supply` (all minted tokens participate equally).",
        "Unsold pool tokens earn revenue that remains in the vault.",
        "New investors' `revenue_debt` is snapshotted at invest time so they",
        "cannot claim revenue from before their entry."
      ],
      "discriminator": [94, 34, 239, 201, 147, 227, 29, 30],
      "accounts": [
        {
          "name": "admin",
          "docs": ["Admin must match vault.admin (enforced by has_one)"],
          "writable": true,
          "signer": true,
          "relations": ["asset_vault"]
        },
        {
          "name": "asset_vault",
          "docs": ["Vault receives the SOL deposit and its accumulator is updated"],
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "total_revenue",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize_asset",
      "docs": [
        "Initialize a new tokenized real-world asset.",
        "Creates the AssetVault PDA, mints total_supply whole tokens (0 decimals),",
        "and distributes: 70% → investor pool | 20% → platform | 10% → reserve."
      ],
      "discriminator": [214, 153, 49, 248, 95, 248, 208, 179],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "asset_vault",
          "docs": ["Asset vault PDA — seeds: [\"asset\", asset_name]"],
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [97, 115, 115, 101, 116] },
              { "kind": "arg", "path": "asset_name" }
            ]
          }
        },
        {
          "name": "token_mint",
          "docs": ["New SPL mint — 0 decimals (whole tokens), authority = vault PDA"],
          "writable": true,
          "signer": true
        },
        {
          "name": "investor_pool_token_account",
          "docs": ["Investor pool token account — PDA seeds: [\"investor_pool\", asset_vault]"],
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [105, 110, 118, 101, 115, 116, 111, 114, 95, 112, 111, 111, 108] },
              { "kind": "account", "path": "asset_vault" }
            ]
          }
        },
        { "name": "platform" },
        {
          "name": "platform_token_account",
          "docs": ["Platform's ATA for this mint (created here)"],
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "account", "path": "platform" },
              { "kind": "const", "value": [6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169] },
              { "kind": "account", "path": "token_mint" }
            ],
            "program": {
              "kind": "const",
              "value": [140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216, 219, 233, 248, 89]
            }
          }
        },
        { "name": "reserve" },
        {
          "name": "reserve_token_account",
          "docs": ["Reserve's ATA for this mint (created here)"],
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "account", "path": "reserve" },
              { "kind": "const", "value": [6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169] },
              { "kind": "account", "path": "token_mint" }
            ],
            "program": {
              "kind": "const",
              "value": [140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216, 219, 233, 248, 89]
            }
          }
        },
        { "name": "token_program", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { "name": "associated_token_program", "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "asset_name", "type": "string" },
        { "name": "total_supply", "type": "u64" },
        { "name": "token_price_lamports", "type": "u64" }
      ]
    },
    {
      "name": "invest",
      "docs": [
        "Invest: send SOL, receive tokens proportional to token_price.",
        "",
        "`amount` = number of whole tokens to purchase.",
        "SOL cost = amount * asset_vault.token_price (in lamports).",
        "Validates: asset active, amount >= MIN_INVESTMENT_TOKENS, pool has enough supply."
      ],
      "discriminator": [13, 245, 180, 103, 254, 182, 121, 4],
      "accounts": [
        { "name": "investor", "writable": true, "signer": true },
        {
          "name": "asset_vault",
          "docs": ["Vault must be active; verified via require! in invest()"],
          "writable": true
        },
        {
          "name": "investor_account",
          "docs": ["Per-user per-asset tracking account — created on first invest"],
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [105, 110, 118, 101, 115, 116, 111, 114] },
              { "kind": "account", "path": "asset_vault" },
              { "kind": "account", "path": "investor" }
            ]
          }
        },
        {
          "name": "investor_pool_token_account",
          "docs": ["Must match asset_vault.investor_pool_token_account"],
          "writable": true
        },
        {
          "name": "token_mint",
          "docs": ["Mint verified against asset_vault.token_mint — needed for ATA creation"]
        },
        {
          "name": "investor_token_account",
          "docs": ["Investor's ATA for the asset token — created if it doesn't exist"],
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "account", "path": "investor" },
              { "kind": "const", "value": [6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169] },
              { "kind": "account", "path": "token_mint" }
            ],
            "program": {
              "kind": "const",
              "value": [140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216, 219, 233, 248, 89]
            }
          }
        },
        { "name": "token_program", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { "name": "associated_token_program", "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "withdraw",
      "docs": [
        "Withdraw claimable revenue accumulated since last claim (or first investment).",
        "",
        "claimable = (vault.revenue_per_token_scaled − investor.revenue_debt)",
        "× tokens_held ÷ REVENUE_SCALE",
        "",
        "Lamports are moved directly from the vault PDA (program-owned) to the",
        "investor wallet — the system program cannot sign for program-owned accounts."
      ],
      "discriminator": [183, 18, 70, 156, 148, 109, 161, 34],
      "accounts": [
        { "name": "investor", "writable": true, "signer": true },
        {
          "name": "asset_vault",
          "docs": ["Vault supplies the current revenue_per_token_scaled and receives lamport debit"],
          "writable": true
        },
        {
          "name": "investor_account",
          "docs": ["Investor's tracking account — seeds ensure only the owner can withdraw"],
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [105, 110, 118, 101, 115, 116, 111, 114] },
              { "kind": "account", "path": "asset_vault" },
              { "kind": "account", "path": "investor" }
            ]
          }
        },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "AssetVault",
      "discriminator": [193, 119, 127, 25, 157, 102, 175, 164]
    },
    {
      "name": "InvestorAccount",
      "discriminator": [170, 82, 242, 38, 219, 28, 212, 55]
    }
  ],
  "errors": [
    { "code": 6000, "name": "InvestmentTooSmall", "msg": "Investment amount below minimum required" },
    { "code": 6001, "name": "InvestmentTooLarge", "msg": "Investment would exceed maximum per investor" },
    { "code": 6002, "name": "PoolExhausted", "msg": "No tokens remaining in investor pool" },
    { "code": 6003, "name": "NothingToClaim", "msg": "No revenue available to claim" },
    { "code": 6004, "name": "Unauthorized", "msg": "Unauthorized: caller is not the asset admin" },
    { "code": 6005, "name": "AssetNotActive", "msg": "Asset is not active" },
    { "code": 6006, "name": "MathOverflow", "msg": "Arithmetic overflow" }
  ],
  "types": [
    {
      "name": "AssetVault",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "admin", "docs": ["Admin who can manage the asset"], "type": "pubkey" },
          { "name": "asset_name", "docs": ["Human-readable asset name (max 64 bytes)"], "type": "string" },
          { "name": "total_supply", "docs": ["Total token supply (whole tokens, 0 decimals)"], "type": "u64" },
          { "name": "token_price", "docs": ["Price per token in lamports"], "type": "u64" },
          { "name": "token_mint", "docs": ["SPL Token mint address"], "type": "pubkey" },
          { "name": "investor_pool_token_account", "docs": ["Investor pool token account (PDA-owned by vault)"], "type": "pubkey" },
          { "name": "investor_pool_remaining", "docs": ["Tokens remaining in investor pool"], "type": "u64" },
          { "name": "total_revenue_distributed", "docs": ["Total SOL revenue deposited to date (lamports, informational)"], "type": "u64" },
          { "name": "revenue_per_token_scaled", "docs": ["Cumulative per-token revenue accumulator × REVENUE_SCALE", "Incremented on each distribute_revenue call."], "type": "u64" },
          { "name": "status", "docs": ["Asset status: 0=pending, 1=active, 2=paused"], "type": "u8" },
          { "name": "bump", "docs": ["Bump seed for PDA derivation"], "type": "u8" }
        ]
      }
    },
    {
      "name": "InvestorAccount",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "owner", "docs": ["Investor's wallet"], "type": "pubkey" },
          { "name": "asset_vault", "docs": ["Associated asset vault"], "type": "pubkey" },
          { "name": "tokens_held", "docs": ["Tokens held by this investor"], "type": "u64" },
          { "name": "claimable_revenue", "docs": ["Revenue available to claim (lamports) — legacy field, kept for compatibility"], "type": "u64" },
          { "name": "total_claimed", "docs": ["Total revenue ever claimed (lamports)"], "type": "u64" },
          { "name": "invested_at", "docs": ["Timestamp of first investment (Unix)"], "type": "i64" },
          { "name": "revenue_debt", "docs": ["Snapshot of vault.revenue_per_token_scaled at last claim or investment.", "claimable = (vault.rpt - revenue_debt) * tokens_held / REVENUE_SCALE"], "type": "u64" },
          { "name": "bump", "docs": ["Bump seed"], "type": "u8" }
        ]
      }
    }
  ]
} as const
