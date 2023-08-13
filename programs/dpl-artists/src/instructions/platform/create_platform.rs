use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use mpl_token_metadata::state::AssetData;

use crate::{
    constants::{MAX_DOMAIN_LEN, PLATFORM_SEED},
    errors::ArtistsErrors,
    states::platform::Platform,
    utils::{mint_asset, TokenMetadata},
};

#[derive(Accounts)]
#[instruction(domain: String)]
pub struct CreatePlatform<'info> {
    /// platform account
    #[account(
        init,
        payer = authority,
        seeds = [
            PLATFORM_SEED,
            domain.as_bytes(),
            authority.key.as_ref(),
        ],
        bump,
        space = 8 + Platform::INIT_SPACE,
    )]
    pub platform: Account<'info, Platform>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub mint: Signer<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub token_account: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub master_edition: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub metadata_token_program: Program<'info, TokenMetadata>,

    /// CHECK: metadata program will validate
    pub sysvar_instructions: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    pub associated_token_program: AccountInfo<'info>,
}

pub fn create_platform_handler(
    ctx: Context<CreatePlatform>,
    domain: String,
    asset_data: AssetData,
) -> Result<()> {
    require!(
        domain.len() <= MAX_DOMAIN_LEN,
        ArtistsErrors::DomainLenTooLarge
    );

    let platform = &mut ctx.accounts.platform;

    mint_asset(
        asset_data,
        &ctx.accounts.metadata,
        &ctx.accounts.master_edition,
        &ctx.accounts.mint,
        &ctx.accounts.authority,
        &ctx.accounts.authority,
        &ctx.accounts.token_account,
        &ctx.accounts.authority,
        &ctx.accounts.authority,
        &ctx.accounts.sysvar_instructions,
        &ctx.accounts.token_program,
    )?;

    platform.authority = ctx.accounts.authority.key();
    platform.mint = ctx.accounts.mint.key();
    platform.domain = domain;

    // artist mint can be added using
    // create_and_add_artist_mint() ix

    // artist mint can be added using
    // create_and_add_user_mint() ix

    // supported_tokens can be added using
    // add_supported_token_details() ix

    // subscription_plans can be added using
    // add_subscription_plans() ix

    Ok(())
}
