use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    constants::LIST_SEED,
    errors::ProtocolErrors,
    states::{
        platform::{Duration, Platform},
        user::{List, User},
    },
    utils::{mint_asset_with_signer, TokenMetadata},
};
use mpl_token_metadata::state::AssetData;

#[derive(Accounts)]
#[instruction(listing_starts_at: i64)]
pub struct ListSubscription<'info> {
    /// list account
    #[account(
        init,
        payer = authority,
        seeds = [
            LIST_SEED,
            authority.key.as_ref(),
            listing_starts_at.to_le_bytes().as_ref(),
        ],
        bump,
        space = 8 + List::INIT_SPACE,
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

    /// authority's token account of chosen mint
    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = authority,
    )]
    pub authority_token_account: Box<Account<'info, TokenAccount>>,

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

pub fn list_subscription_handler(
    ctx: Context<ListSubscription>,
    listing_starts_at: i64,
    price: u64,
    asset_data: AssetData,
) -> Result<()> {
    let list = &mut ctx.accounts.list;
    let user = &mut ctx.accounts.user;

    // check if user is already subscribed
    if user.subscription.start_timestamp == 0 {
        return err!(ProtocolErrors::NotSubscribed);
    }

    // check if user has subscribed to long-term plans (> 26 weeks)
    // TODO: Disabled for testing purpose
    // if user.subscription.subscribed_plan.duration != Duration::TwentySix
    //     && user.subscription.subscribed_plan.duration != Duration::FiftyTwo
    // {
    //     return err!(ProtocolErrors::ListingNotAllowed);
    // }

    // check if user has enough balance
    if ctx.accounts.authority_token_account.amount < price {
        return err!(ProtocolErrors::InsufficientBalance);
    }

    let signer_seeds = [
        LIST_SEED,
        ctx.accounts.authority.key.as_ref(),
        &listing_starts_at.to_le_bytes(),
        &[*ctx.bumps.get("list").unwrap()],
    ];

    mint_asset_with_signer(
        asset_data,
        &ctx.accounts.metadata,
        &ctx.accounts.master_edition,
        &ctx.accounts.mint,
        &ctx.accounts.authority,
        &ctx.accounts.authority,
        &ctx.accounts.token_account,
        &list.to_account_info(),
        &ctx.accounts.authority,
        &ctx.accounts.sysvar_instructions,
        &ctx.accounts.token_program,
        &signer_seeds,
    )?;

    list.authority = ctx.accounts.authority.key();
    list.start_timestamp = listing_starts_at;
    list.price = price;
    list.payment_mint = ctx.accounts.payment_mint.key();
    list.token_account = ctx.accounts.authority_token_account.key();
    list.mint = ctx.accounts.mint.key();
    list.is_claimable = false;
    list.buyer = None;

    Ok(())
}
