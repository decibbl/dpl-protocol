use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use mpl_token_metadata::state::AssetData;

use crate::{
    constants::{ARTWORK_SEED, COLLECTION_SEED, ARTIST_SEED},
    states::{
        artist::Artist,
        platform::Platform, collection::Collection, artwork::Artwork,
    },
    utils::{mint_asset_with_signer, TokenMetadata},
};

#[derive(Accounts)]
pub struct CreateArtwork<'info> {
    /// artwork account
    #[account(
        init,
        payer = authority,
        seeds = [
            ARTWORK_SEED,
            authority.key.as_ref(),
            mint.key.as_ref(),
        ],
        bump,
        space = 8 + Artwork::INIT_SPACE,
    )]
    pub artwork: Box<Account<'info, Artwork>>,
    
    /// collection account
    #[account(
        seeds = [
            COLLECTION_SEED,
            authority.key.as_ref(),
            collection.mint.key().as_ref(),
        ],
        bump,
    )]
    pub collection: Option<Box<Account<'info, Collection>>>,
    
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

pub fn create_artwork_handler(
    ctx: Context<CreateArtwork>,
    asset_data: AssetData,
    is_collection: bool
) -> Result<()> {
    let artwork = &mut ctx.accounts.artwork;

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

    artwork.artist = ctx.accounts.authority.key();
    artwork.mint = ctx.accounts.mint.key();
    
    if is_collection && ctx.accounts.collection.is_some() {
        artwork.collection = Some(ctx.accounts.collection.as_mut().unwrap().key());
    }

    artwork.platforms.push(ctx.accounts.platform.key());

    Ok(())
}
