use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use mpl_token_metadata::instruction::PrintArgs;

use crate::{
    constants::{ARTIST_SEED, ARTWORK_SEED, COLLECTION_SEED},
    errors::ArtistsErrors,
    states::{artist::Artist, artwork::Artwork, collection::Collection, platform::Platform},
    utils::{print_asset_with_signer, TokenMetadata},
};

#[derive(Accounts)]
pub struct PrintEdition<'info> {
    /// artwork account
    #[account(
        seeds = [
            ARTWORK_SEED,
            authority.key.as_ref(),
            master_mint.key().as_ref(),
        ],
        bump,
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

    pub master_mint: Account<'info, Mint>,

    /// CHECK: metadata program will validate
    pub master_token_account: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    pub master_metadata: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub master_edition: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub edition_metadata: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub edition: AccountInfo<'info>,

    #[account(mut)]
    pub edition_mint: Signer<'info>,

    pub owner: Signer<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub edition_token_account: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub edition_marker_pda: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub metadata_token_program: Program<'info, TokenMetadata>,

    /// CHECK: metadata program will validate
    pub sysvar_instructions: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    pub associated_token_program: AccountInfo<'info>,
}

pub fn print_artwork_handler(ctx: Context<PrintEdition>, print_args: PrintArgs) -> Result<()> {
    let artwork = &mut ctx.accounts.artwork;

    require!(
        artwork.mint.key() == ctx.accounts.master_mint.key(),
        ArtistsErrors::InvalidMint
    );

    let signer_seeds = [
        ARTIST_SEED,
        ctx.accounts.authority.key.as_ref(),
        &[*ctx.bumps.get("artist").unwrap()],
    ];

    print_asset_with_signer(
        &ctx.accounts.edition_metadata,
        &ctx.accounts.edition,
        &ctx.accounts.edition_mint,
        &ctx.accounts.owner,
        &ctx.accounts.edition_token_account,
        &ctx.accounts.owner,
        &ctx.accounts.master_edition,
        &ctx.accounts.edition_marker_pda,
        &ctx.accounts.authority,
        &ctx.accounts.authority,
        &ctx.accounts.master_token_account,
        &ctx.accounts.master_metadata,
        &ctx.accounts.authority,
        &ctx.accounts.token_program,
        &ctx.accounts.associated_token_program,
        &ctx.accounts.sysvar_instructions,
        &ctx.accounts.system_program,
        &signer_seeds,
        print_args,
    )?;

    Ok(())
}
