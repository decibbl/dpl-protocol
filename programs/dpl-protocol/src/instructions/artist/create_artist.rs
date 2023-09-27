use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use mpl_token_metadata::state::{AssetData, PrintSupply};

use crate::{
    constants::{ARTIST_SEED, PLATFORM_SEED},
    states::{
        artist::{Artist, PlatformDetails},
        platform::Platform,
    },
    utils::{mint_asset_with_signer, TokenMetadata},
};

#[derive(Accounts)]
pub struct CreateArtist<'info> {
    /// artist account
    #[account(
        init,
        payer = authority,
        seeds = [
            ARTIST_SEED,
            authority.key.as_ref(),
        ],
        bump,
        space = 8 + Artist::INIT_SPACE,
    )]
    pub artist: Box<Account<'info, Artist>>,

    /// platform account
    #[account(
        mut,
        seeds = [
            PLATFORM_SEED,
            platform.domain.as_bytes(),
            collection_authority.key.as_ref(),
        ],
        bump,
    )]
    pub platform: Box<Account<'info, Platform>>,

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

    /// CHECK:
    #[account(mut)]
    pub collection_authority: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub collection_mint: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub collection_metadata: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub collection_master_edition: AccountInfo<'info>,

    pub token_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub metadata_token_program: Program<'info, TokenMetadata>,

    /// CHECK: metadata program will validate
    pub sysvar_instructions: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    pub associated_token_program: AccountInfo<'info>,
}

pub fn create_artist_handler(ctx: Context<CreateArtist>, asset_data: AssetData) -> Result<()> {
    let artist = &mut ctx.accounts.artist;

    let signer_seeds = [
        PLATFORM_SEED,
        ctx.accounts.platform.domain.as_bytes(),
        ctx.accounts.collection_authority.key.as_ref(),
        &[*ctx.bumps.get("platform").unwrap()],
    ];

    mint_asset_with_signer(
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
        &ctx.accounts.collection_mint,
        &ctx.accounts.collection_metadata,
        &ctx.accounts.collection_master_edition,
        &ctx.accounts.platform.to_account_info(),
        Some(PrintSupply::Zero),
        &signer_seeds,
    )?;

    artist.authority = ctx.accounts.authority.key();
    artist.mint = ctx.accounts.mint.key();
    artist.platforms = PlatformDetails {
        address: ctx.accounts.platform.key(),
        mint: ctx.accounts.token_mint.key(),
    };

    Ok(())
}
