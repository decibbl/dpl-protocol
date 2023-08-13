use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use mpl_token_metadata::state::AssetData;

use crate::{
    constants::{COLLECTION_SEED, ARTIST_SEED},
    states::{
        artist::Artist,
        platform::Platform, collection::Collection,
    },
    utils::{mint_asset_with_signer, TokenMetadata},
};

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    /// collection account
    #[account(
        init,
        payer = authority,
        seeds = [
            COLLECTION_SEED,
            authority.key.as_ref(),
            mint.key.as_ref(),
        ],
        bump,
        space = 8 + Collection::INIT_SPACE,
    )]
    pub collection: Box<Account<'info, Collection>>,
    
    /// artist account
    #[account(
        has_one = authority,
        seeds = [
            ARTIST_SEED,
            authority.key.as_ref(),
        ],
        bump,
    )]
    pub artist: Box<Account<'info, Artist>>,

    /// platform account
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

pub fn create_collection_handler(ctx: Context<CreateCollection>, asset_data: AssetData) -> Result<()> {
    let collection = &mut ctx.accounts.collection;

    let signer_seeds = [
        ARTIST_SEED,
        ctx.accounts.authority.key.as_ref(),
        &[*ctx.bumps.get("artist").unwrap()],
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
        &ctx.accounts.authority.to_account_info(),
        &signer_seeds,
    )?;

    collection.artist = ctx.accounts.artist.authority.key();
    collection.mint = ctx.accounts.mint.key();
    collection.platforms.push(ctx.accounts.platform.key());

    Ok(())
}
