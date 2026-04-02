use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, MintTo, Token, TokenAccount},
};

declare_id!("BLiqwdcVRPVT7Z4UjVkCaRzcK8Ui91s3edtZz94YWJf8");

/// Minimum tokens per investment (~$50 at $1/token)
pub const MIN_INVESTMENT_TOKENS: u64 = 50;

/// Precision multiplier for per-token revenue accumulator.
/// Allows sub-lamport precision in intermediate math without floating point.
/// claimable_lamports = (rpt_scaled_delta * tokens_held) / REVENUE_SCALE
pub const REVENUE_SCALE: u64 = 1_000_000;

#[program]
pub mod rwa_token {
    use super::*;

    /// Initialize a new tokenized real-world asset.
    /// Creates the AssetVault PDA, mints total_supply whole tokens (0 decimals),
    /// and distributes: 70% → investor pool | 20% → platform | 10% → reserve.
    pub fn initialize_asset(
        ctx: Context<InitializeAsset>,
        asset_name: String,
        total_supply: u64,
        token_price_lamports: u64,
    ) -> Result<()> {
        let bump = ctx.bumps.asset_vault;

        // --- Distribution: 70 / 20 / 10 ---
        let investor_amount = total_supply
            .checked_mul(70)
            .ok_or(RwaError::MathOverflow)?
            .checked_div(100)
            .ok_or(RwaError::MathOverflow)?;
        let platform_amount = total_supply
            .checked_mul(20)
            .ok_or(RwaError::MathOverflow)?
            .checked_div(100)
            .ok_or(RwaError::MathOverflow)?;
        // Reserve absorbs any rounding remainder so total == total_supply
        let reserve_amount = total_supply
            .checked_sub(investor_amount)
            .ok_or(RwaError::MathOverflow)?
            .checked_sub(platform_amount)
            .ok_or(RwaError::MathOverflow)?;

        // Keep name bytes before asset_name is moved into the vault
        let name_bytes = asset_name.as_bytes().to_vec();

        // --- Populate vault (scoped so the mut borrow is dropped before CPIs) ---
        {
            let vault = &mut ctx.accounts.asset_vault;
            vault.admin = ctx.accounts.admin.key();
            vault.asset_name = asset_name;
            vault.total_supply = total_supply;
            vault.token_price = token_price_lamports;
            vault.token_mint = ctx.accounts.token_mint.key();
            vault.investor_pool_token_account = ctx.accounts.investor_pool_token_account.key();
            vault.investor_pool_remaining = investor_amount;
            vault.total_revenue_distributed = 0;
            vault.revenue_per_token_scaled = 0;
            vault.status = 1; // active
            vault.bump = bump;
        }

        // PDA signer: ["asset", asset_name_bytes, bump]
        let signer_seeds: &[&[&[u8]]] = &[&[b"asset", name_bytes.as_slice(), &[bump]]];

        // --- Mint 70% → investor pool (vault-controlled PDA token account) ---
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.investor_pool_token_account.to_account_info(),
                    authority: ctx.accounts.asset_vault.to_account_info(),
                },
                signer_seeds,
            ),
            investor_amount,
        )?;

        // --- Mint 20% → platform ATA ---
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.platform_token_account.to_account_info(),
                    authority: ctx.accounts.asset_vault.to_account_info(),
                },
                signer_seeds,
            ),
            platform_amount,
        )?;

        // --- Mint 10% → reserve ATA ---
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.reserve_token_account.to_account_info(),
                    authority: ctx.accounts.asset_vault.to_account_info(),
                },
                signer_seeds,
            ),
            reserve_amount,
        )?;

        Ok(())
    }

    /// Invest: send SOL, receive tokens proportional to token_price.
    ///
    /// `amount` = number of whole tokens to purchase.
    /// SOL cost = amount * asset_vault.token_price (in lamports).
    /// Validates: asset active, amount >= MIN_INVESTMENT_TOKENS, pool has enough supply.
    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        // --- Read vault state upfront (before any mutable borrows) ---
        let vault_status = ctx.accounts.asset_vault.status;
        let vault_pool_remaining = ctx.accounts.asset_vault.investor_pool_remaining;
        let vault_token_price = ctx.accounts.asset_vault.token_price;
        let vault_bump = ctx.accounts.asset_vault.bump;
        let vault_key = ctx.accounts.asset_vault.key();
        let vault_rpt = ctx.accounts.asset_vault.revenue_per_token_scaled;
        let name_bytes = ctx.accounts.asset_vault.asset_name.as_bytes().to_vec();

        // --- Validations ---
        require!(vault_status == 1, RwaError::AssetNotActive);
        require!(amount >= MIN_INVESTMENT_TOKENS, RwaError::InvestmentTooSmall);
        require!(vault_pool_remaining >= amount, RwaError::PoolExhausted);

        // Calculate SOL cost using u128 to prevent overflow before casting
        let cost_lamports = (amount as u128)
            .checked_mul(vault_token_price as u128)
            .ok_or(RwaError::MathOverflow)? as u64;

        // --- CPI 1: Transfer SOL investor → asset_vault PDA ---
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.investor.to_account_info(),
                    to: ctx.accounts.asset_vault.to_account_info(),
                },
            ),
            cost_lamports,
        )?;

        // --- CPI 2: Transfer tokens investor_pool → investor ATA (signed by vault PDA) ---
        let signer_seeds: &[&[&[u8]]] = &[&[b"asset", name_bytes.as_slice(), &[vault_bump]]];

        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.investor_pool_token_account.to_account_info(),
                    to: ctx.accounts.investor_token_account.to_account_info(),
                    authority: ctx.accounts.asset_vault.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        // --- Update vault: decrement investor pool ---
        {
            let vault = &mut ctx.accounts.asset_vault;
            vault.investor_pool_remaining = vault_pool_remaining
                .checked_sub(amount)
                .ok_or(RwaError::MathOverflow)?;
        }

        // --- Create or update InvestorAccount ---
        let now = Clock::get()?.unix_timestamp;
        let investor_account = &mut ctx.accounts.investor_account;

        // On first investment owner is Pubkey::default (zero-initialized by init_if_needed)
        if investor_account.owner == Pubkey::default() {
            investor_account.owner = ctx.accounts.investor.key();
            investor_account.asset_vault = vault_key;
            investor_account.invested_at = now;
            investor_account.claimable_revenue = 0;
            investor_account.total_claimed = 0;
            // Snapshot current rpt so new investor only claims future revenue
            investor_account.revenue_debt = vault_rpt;
            investor_account.bump = ctx.bumps.investor_account;
        }

        investor_account.tokens_held = investor_account.tokens_held
            .checked_add(amount)
            .ok_or(RwaError::MathOverflow)?;

        Ok(())
    }

    /// Distribute revenue proportionally to all token holders.
    ///
    /// Admin deposits `total_revenue` lamports into the vault.
    /// Uses a per-token accumulator so no iteration is needed — O(1) complexity.
    /// Each holder claims their share lazily when calling `withdraw`.
    ///
    /// Denominator: `total_supply` (all minted tokens participate equally).
    /// Unsold pool tokens earn revenue that remains in the vault.
    /// New investors' `revenue_debt` is snapshotted at invest time so they
    /// cannot claim revenue from before their entry.
    pub fn distribute_revenue(ctx: Context<DistributeRevenue>, total_revenue: u64) -> Result<()> {
        require!(total_revenue > 0, RwaError::MathOverflow);

        // Read immutable vault fields before mutable borrow
        let vault_status = ctx.accounts.asset_vault.status;
        let total_supply = ctx.accounts.asset_vault.total_supply;
        let current_rpt = ctx.accounts.asset_vault.revenue_per_token_scaled;
        let current_total = ctx.accounts.asset_vault.total_revenue_distributed;

        require!(vault_status == 1, RwaError::AssetNotActive);
        require!(total_supply > 0, RwaError::MathOverflow);

        // --- Calculate per-token increment (scaled to preserve precision) ---
        // revenue_increment = (total_revenue * REVENUE_SCALE) / total_supply
        // u128 intermediate prevents overflow: max(u64) * 10^6 fits in u128
        let revenue_increment = (total_revenue as u128)
            .checked_mul(REVENUE_SCALE as u128)
            .ok_or(RwaError::MathOverflow)?
            .checked_div(total_supply as u128)
            .ok_or(RwaError::MathOverflow)? as u64;

        // Reject if so small it rounds to zero (e.g. dust deposits)
        require!(revenue_increment > 0, RwaError::MathOverflow);

        // --- CPI: Admin deposits SOL into asset_vault PDA ---
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.admin.to_account_info(),
                    to: ctx.accounts.asset_vault.to_account_info(),
                },
            ),
            total_revenue,
        )?;

        // --- Update vault accumulators ---
        let vault = &mut ctx.accounts.asset_vault;

        vault.revenue_per_token_scaled = current_rpt
            .checked_add(revenue_increment)
            .ok_or(RwaError::MathOverflow)?;

        vault.total_revenue_distributed = current_total
            .checked_add(total_revenue)
            .ok_or(RwaError::MathOverflow)?;

        Ok(())
    }

    /// Withdraw claimable revenue accumulated since last claim (or first investment).
    ///
    /// claimable = (vault.revenue_per_token_scaled − investor.revenue_debt)
    ///             × tokens_held ÷ REVENUE_SCALE
    ///
    /// Lamports are moved directly from the vault PDA (program-owned) to the
    /// investor wallet — the system program cannot sign for program-owned accounts.
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        // --- Read all needed values upfront (before any mutable borrows) ---
        let vault_rpt = ctx.accounts.asset_vault.revenue_per_token_scaled;
        let tokens_held = ctx.accounts.investor_account.tokens_held;
        let revenue_debt = ctx.accounts.investor_account.revenue_debt;
        let total_claimed = ctx.accounts.investor_account.total_claimed;

        // --- Validations ---
        require!(tokens_held > 0, RwaError::NothingToClaim);
        require!(vault_rpt > revenue_debt, RwaError::NothingToClaim);

        let rpt_delta = vault_rpt
            .checked_sub(revenue_debt)
            .ok_or(RwaError::MathOverflow)?;

        // claimable = delta × tokens_held ÷ REVENUE_SCALE
        // u128 intermediate prevents overflow for large deltas × large positions
        let claimable = (rpt_delta as u128)
            .checked_mul(tokens_held as u128)
            .ok_or(RwaError::MathOverflow)?
            .checked_div(REVENUE_SCALE as u128)
            .ok_or(RwaError::MathOverflow)? as u64;

        require!(claimable > 0, RwaError::NothingToClaim);

        // Ensure vault retains rent-exempt minimum after the payout
        let vault_info = ctx.accounts.asset_vault.to_account_info();
        let min_lamports = Rent::get()?.minimum_balance(vault_info.data_len());
        require!(
            vault_info
                .lamports()
                .checked_sub(claimable)
                .unwrap_or(0)
                >= min_lamports,
            RwaError::NothingToClaim
        );

        // --- Transfer lamports: vault PDA → investor ---
        // Direct manipulation is required because the vault is program-owned;
        // system_program::transfer only works for system-owned accounts.
        let investor_info = ctx.accounts.investor.to_account_info();

        **vault_info.try_borrow_mut_lamports()? = vault_info
            .lamports()
            .checked_sub(claimable)
            .ok_or(RwaError::MathOverflow)?;

        **investor_info.try_borrow_mut_lamports()? = investor_info
            .lamports()
            .checked_add(claimable)
            .ok_or(RwaError::MathOverflow)?;

        // --- Update investor: advance debt snapshot, accumulate total ---
        let investor_account = &mut ctx.accounts.investor_account;
        investor_account.revenue_debt = vault_rpt;
        investor_account.total_claimed = total_claimed
            .checked_add(claimable)
            .ok_or(RwaError::MathOverflow)?;

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
    /// Human-readable asset name (max 64 bytes)
    pub asset_name: String,
    /// Total token supply (whole tokens, 0 decimals)
    pub total_supply: u64,
    /// Price per token in lamports
    pub token_price: u64,
    /// SPL Token mint address
    pub token_mint: Pubkey,
    /// Investor pool token account (PDA-owned by vault)
    pub investor_pool_token_account: Pubkey,
    /// Tokens remaining in investor pool
    pub investor_pool_remaining: u64,
    /// Total SOL revenue deposited to date (lamports, informational)
    pub total_revenue_distributed: u64,
    /// Cumulative per-token revenue accumulator × REVENUE_SCALE
    /// Incremented on each distribute_revenue call.
    pub revenue_per_token_scaled: u64,
    /// Asset status: 0=pending, 1=active, 2=paused
    pub status: u8,
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl AssetVault {
    /// discriminator(8) + admin(32) + asset_name(4+64) + total_supply(8) + token_price(8)
    /// + token_mint(32) + investor_pool_token_account(32) + pool_remaining(8)
    /// + total_revenue_distributed(8) + revenue_per_token_scaled(8) + status(1) + bump(1) = 214
    pub const SPACE: usize = 8 + 32 + (4 + 64) + 8 + 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct InvestorAccount {
    /// Investor's wallet
    pub owner: Pubkey,
    /// Associated asset vault
    pub asset_vault: Pubkey,
    /// Tokens held by this investor
    pub tokens_held: u64,
    /// Revenue available to claim (lamports) — legacy field, kept for compatibility
    pub claimable_revenue: u64,
    /// Total revenue ever claimed (lamports)
    pub total_claimed: u64,
    /// Timestamp of first investment (Unix)
    pub invested_at: i64,
    /// Snapshot of vault.revenue_per_token_scaled at last claim or investment.
    /// claimable = (vault.rpt - revenue_debt) * tokens_held / REVENUE_SCALE
    pub revenue_debt: u64,
    /// Bump seed
    pub bump: u8,
}

impl InvestorAccount {
    /// discriminator(8) + owner(32) + asset_vault(32) + tokens_held(8)
    /// + claimable_revenue(8) + total_claimed(8) + invested_at(8) + revenue_debt(8) + bump(1) = 113
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

// ============================================================
// Instruction Contexts
// ============================================================

#[derive(Accounts)]
#[instruction(asset_name: String)]
pub struct InitializeAsset<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Asset vault PDA — seeds: ["asset", asset_name]
    #[account(
        init,
        payer = admin,
        space = AssetVault::SPACE,
        seeds = [b"asset", asset_name.as_bytes()],
        bump,
    )]
    pub asset_vault: Account<'info, AssetVault>,

    /// New SPL mint — 0 decimals (whole tokens), authority = vault PDA
    #[account(
        init,
        payer = admin,
        mint::decimals = 0,
        mint::authority = asset_vault,
        mint::freeze_authority = asset_vault,
    )]
    pub token_mint: Account<'info, Mint>,

    /// Investor pool token account — PDA seeds: ["investor_pool", asset_vault]
    #[account(
        init,
        payer = admin,
        seeds = [b"investor_pool", asset_vault.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = asset_vault,
    )]
    pub investor_pool_token_account: Account<'info, TokenAccount>,

    /// CHECK: Platform wallet — receives 20% of token supply
    pub platform: UncheckedAccount<'info>,

    /// Platform's ATA for this mint (created here)
    #[account(
        init,
        payer = admin,
        associated_token::mint = token_mint,
        associated_token::authority = platform,
    )]
    pub platform_token_account: Account<'info, TokenAccount>,

    /// CHECK: Reserve wallet — receives 10% of token supply
    pub reserve: UncheckedAccount<'info>,

    /// Reserve's ATA for this mint (created here)
    #[account(
        init,
        payer = admin,
        associated_token::mint = token_mint,
        associated_token::authority = reserve,
    )]
    pub reserve_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    /// Vault must be active; verified via require! in invest()
    #[account(mut)]
    pub asset_vault: Account<'info, AssetVault>,

    /// Per-user per-asset tracking account — created on first invest
    #[account(
        init_if_needed,
        payer = investor,
        space = InvestorAccount::SPACE,
        seeds = [b"investor", asset_vault.key().as_ref(), investor.key().as_ref()],
        bump,
    )]
    pub investor_account: Account<'info, InvestorAccount>,

    /// Must match asset_vault.investor_pool_token_account
    #[account(
        mut,
        address = asset_vault.investor_pool_token_account,
    )]
    pub investor_pool_token_account: Account<'info, TokenAccount>,

    /// Mint verified against asset_vault.token_mint — needed for ATA creation
    #[account(address = asset_vault.token_mint)]
    pub token_mint: Account<'info, Mint>,

    /// Investor's ATA for the asset token — created if it doesn't exist
    #[account(
        init_if_needed,
        payer = investor,
        associated_token::mint = token_mint,
        associated_token::authority = investor,
    )]
    pub investor_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeRevenue<'info> {
    /// Admin must match vault.admin (enforced by has_one)
    #[account(mut)]
    pub admin: Signer<'info>,

    /// Vault receives the SOL deposit and its accumulator is updated
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

    /// Vault supplies the current revenue_per_token_scaled and receives lamport debit
    #[account(mut)]
    pub asset_vault: Account<'info, AssetVault>,

    /// Investor's tracking account — seeds ensure only the owner can withdraw
    #[account(
        mut,
        seeds = [b"investor", asset_vault.key().as_ref(), investor.key().as_ref()],
        bump = investor_account.bump,
        constraint = investor_account.owner == investor.key() @ RwaError::Unauthorized,
    )]
    pub investor_account: Account<'info, InvestorAccount>,

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
