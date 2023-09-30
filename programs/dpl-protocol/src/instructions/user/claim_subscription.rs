use anchor_lang::prelude::*;
use anchor_spl::token::Token;

use crate::{
    constants::LIST_SEED,
    errors::ProtocolErrors,
    states::{
        platform::Platform,
        user::{List, User},
    },
    utils::{burn_asset_with_signer, TokenMetadata},
};

#[derive(Accounts)]
#[instruction(listing_starts_at: i64)]
pub struct ClaimSubscription<'info> {
    /// list account
    #[account(
        mut,
        seeds = [
            LIST_SEED,
            seller.key.as_ref(),
            listing_starts_at.to_le_bytes().as_ref(),
        ],
        bump,
        constraint = list.authority == seller.key(),
        close = seller
    )]
    pub list: Account<'info, List>,

    /// platform account
    pub platform: Account<'info, Platform>,

    /// user account of buyer
    #[account(
        constraint = user.authority == buyer.key(),
        constraint = user.platform == platform.key()
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: seller will get back the rent of list account
    #[account(mut)]
    pub seller: AccountInfo<'info>,

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

pub fn claim_subscription_handler(
    ctx: Context<ClaimSubscription>,
    listing_starts_at: i64,
) -> Result<()> {
    let list = &ctx.accounts.list;

    // check if its claimable
    require!(list.is_claimable, ProtocolErrors::NotClaimable);

    // check if buyer is valid
    require!(
        list.buyer.unwrap() == ctx.accounts.buyer.key(),
        ProtocolErrors::InvalidBuyer
    );

    let signer_seeds = [
        LIST_SEED,
        ctx.accounts.seller.key.as_ref(),
        &listing_starts_at.to_le_bytes(),
        &[*ctx.bumps.get("list").unwrap()],
    ];

    burn_asset_with_signer(
        &ctx.accounts.metadata,
        &ctx.accounts.master_edition,
        &ctx.accounts.mint,
        &ctx.accounts.buyer,
        &ctx.accounts.token_account,
        &ctx.accounts.sysvar_instructions,
        &ctx.accounts.token_program,
        &signer_seeds,
    )?;

    Ok(())
}
