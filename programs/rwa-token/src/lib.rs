use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

#[program]
pub mod rwa_token {
    use super::*;

    /// Initialize a new tokenized real-world asset
    pub fn initialize_asset(
        ctx: Context<InitializeAsset>,
        asset_name: String,
        total_supply: u64,
        token_price_lamports: u64,
    ) -> Result<()> {
        // TODO: Implement
        // 1. Create AssetVault PDA with metadata
        // 2. Mint SPL tokens (total_supply)
        // 3. Allocate: 70% investor pool, 20% platform, 10% reserve
        Ok(())
    }

    /// Allow a user to invest by purchasing tokens
    pub fn invest(
        ctx: Context<Invest>,
        amount: u64,
    ) -> Result<()> {
        // TODO: Implement
        // 1. Validate minimum investment
        // 2. Accept SOL payment
        // 3. Transfer tokens from investor pool to user
        // 4. Create/update InvestorAccount
        Ok(())
    }

    /// Distribute revenue to all token holders
    pub fn distribute_revenue(
        ctx: Context<DistributeRevenue>,
        total_revenue: u64,
    ) -> Result<()> {
        // TODO: Implement
        // 1. Validate admin authority
        // 2. Calculate per-token share
        // 3. Update claimable balances
        Ok(())
    }

    /// Allow investor to withdraw claimable revenue
    pub fn withdraw(
        ctx: Context<Withdraw>,
    ) -> Result<()> {
        // TODO: Implement
        // 1. Check claimable balance
        // 2. Transfer SOL to investor
        // 3. Reset claimable balance
        Ok(())
    }
}

// ============================================================
// Account Structs
// ============================================================

#[account]
pub struct AssetVault {
    /// Admin who can manage the asset
    pub admin: Pubkey,
    /// Human-readable asset name
    pub asset_name: String,
    /// Total token supply
    pub total_supply: u64,
    /// Price per token in lamports
    pub token_price: u64,
    /// SPL Token mint address
    pub token_mint: Pubkey,
    /// Tokens remaining in investor pool
    pub investor_pool_remaining: u64,
    /// Total revenue distributed to date
    pub total_revenue_distributed: u64,
    /// Asset status (0=pending, 1=active, 2=paused)
    pub status: u8,
    /// Bump seed for PDA derivation
    pub bump: u8,
}

#[account]
pub struct InvestorAccount {
    /// Investor's wallet
    pub owner: Pubkey,
    /// Associated asset vault
    pub asset_vault: Pubkey,
    /// Tokens held by this investor
    pub tokens_held: u64,
    /// Revenue available to claim
    pub claimable_revenue: u64,
    /// Total revenue ever claimed
    pub total_claimed: u64,
    /// Timestamp of first investment
    pub invested_at: i64,
    /// Bump seed
    pub bump: u8,
}

// ============================================================
// Instruction Contexts
// ============================================================

#[derive(Accounts)]
#[instruction(asset_name: String)]
pub struct InitializeAsset<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 4 + 64 + 8 + 8 + 32 + 8 + 8 + 1 + 1,
        seeds = [b"asset", asset_name.as_bytes()],
        bump
    )]
    pub asset_vault: Account<'info, AssetVault>,

    pub system_program: Program<'info, System>,
    // TODO: Add token mint, token program accounts
}

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    #[account(mut)]
    pub asset_vault: Account<'info, AssetVault>,

    // TODO: Add investor account PDA, token accounts
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeRevenue<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        has_one = admin,
    )]
    pub asset_vault: Account<'info, AssetVault>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    #[account(mut)]
    pub asset_vault: Account<'info, AssetVault>,

    // TODO: Add investor account PDA
    pub system_program: Program<'info, System>,
}

// ============================================================
// Custom Errors
// ============================================================

#[error_code]
pub enum RwaError {
    #[msg("Investment amount below minimum required")]
    InvestmentTooSmall,
    #[msg("Investment would exceed maximum per investor")]
    InvestmentTooLarge,
    #[msg("No tokens remaining in investor pool")]
    PoolExhausted,
    #[msg("No revenue available to claim")]
    NothingToClaim,
    #[msg("Unauthorized: caller is not the asset admin")]
    Unauthorized,
    #[msg("Asset is not active")]
    AssetNotActive,
    #[msg("Arithmetic overflow")]
    MathOverflow,
}
