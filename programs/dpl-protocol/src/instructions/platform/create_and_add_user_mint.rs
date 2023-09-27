use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use mpl_token_metadata::state::{AssetData, PrintSupply};

use crate::{
    constants::PLATFORM_SEED,
    states::platform::Platform,
    utils::{mint_asset_with_signer, TokenMetadata},
};

#[derive(Accounts)]
pub struct CreateAndAddUserMint<'info> {
    /// platform account
    #[account(
        mut,
        has_one = authority,
        seeds = [
            PLATFORM_SEED,
            platform.domain.as_bytes(),
            authority.key.as_ref(),
        ],
        bump,
    )]
    pub platform: Account<'info, Platform>,

    /// update authority
    #[account(mut)]
    pub authority: Signer<'info>,

    /// mint account for user's NFT which
    /// is owned by platform PDA
    /// CHECK: metadata program will validate
    #[account(mut)]
    pub mint: Signer<'info>,

    /// token account for user's NFT which
    /// is owned by platform PDA
    /// CHECK: metadata program will validate
    #[account(mut)]
    pub token_account: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub master_edition: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub collection_mint: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub collection_metadata: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub collection_master_edition: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub metadata_token_program: Program<'info, TokenMetadata>,

    /// CHECK: metadata program will validate
    pub sysvar_instructions: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    pub associated_token_program: AccountInfo<'info>,
}

pub fn create_and_add_user_mint_handler(
    ctx: Context<CreateAndAddUserMint>,
    asset_data: AssetData,
) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    let signer_seeds = [
        PLATFORM_SEED,
        platform.domain.as_bytes(),
        ctx.accounts.authority.key.as_ref(),
        &[*ctx.bumps.get("platform").unwrap()],
    ];

    mint_asset_with_signer(
        asset_data,
        &ctx.accounts.metadata,
        &ctx.accounts.master_edition,
        &ctx.accounts.mint,
        &platform.to_account_info(),
        &platform.to_account_info(),
        &ctx.accounts.token_account,
        &ctx.accounts.authority.to_account_info(),
        &ctx.accounts.authority.to_account_info(),
        &ctx.accounts.sysvar_instructions,
        &ctx.accounts.token_program,
        &ctx.accounts.collection_mint,
        &ctx.accounts.collection_metadata,
        &ctx.accounts.collection_master_edition,
        &ctx.accounts.authority,
        Some(PrintSupply::Zero),
        &signer_seeds,
    )?;

    platform.user_mint = ctx.accounts.mint.key();

    Ok(())
}
