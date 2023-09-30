use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    constants::LIST_SEED,
    states::{
        platform::Platform,
        user::{List, User},
    },
    utils::{burn_asset_with_signer, TokenMetadata},
};

#[derive(Accounts)]
#[instruction(listing_starts_at: i64)]
pub struct DelistSubscription<'info> {
    /// list account
    #[account(
        mut,
        seeds = [
            LIST_SEED,
            authority.key.as_ref(),
            listing_starts_at.to_le_bytes().as_ref(),
        ],
        bump,
        has_one = authority,
        close = authority
    )]
    pub list: Box<Account<'info, List>>,

    /// platform account
    pub platform: Box<Account<'info, Platform>>,

    /// user account
    #[account(
        constraint = user.platform == platform.key()
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// mint account of chosen token for payment
    pub payment_mint: Account<'info, Mint>,

    /// user's token account of chosen mint
    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = authority,
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub mint: AccountInfo<'info>,

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

pub fn delist_subscription_handler(
    ctx: Context<DelistSubscription>,
    listing_starts_at: i64,
) -> Result<()> {
    let signer_seeds = [
        LIST_SEED,
        ctx.accounts.authority.key.as_ref(),
        &listing_starts_at.to_le_bytes(),
        &[*ctx.bumps.get("list").unwrap()],
    ];

    burn_asset_with_signer(
        &ctx.accounts.metadata,
        &ctx.accounts.master_edition,
        &ctx.accounts.mint,
        &ctx.accounts.list.to_account_info(),
        &ctx.accounts.token_account,
        &ctx.accounts.sysvar_instructions,
        &ctx.accounts.token_program,
        &signer_seeds,
    )?;

    Ok(())
}
