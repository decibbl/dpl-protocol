use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    constants::LIST_SEED,
    errors::ProtocolErrors,
    states::{
        platform::Platform,
        user::{List, User},
    },
    utils::{transfer_asset_with_signer, TokenMetadata},
};

#[derive(Accounts)]
#[instruction(listing_starts_at: i64)]
pub struct SellSubscription<'info> {
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
    )]
    pub list: Box<Account<'info, List>>,

    /// platform account
    pub platform: Box<Account<'info, Platform>>,

    /// user account of buyer
    #[account(
        constraint = user.authority == buyer.key(),
        constraint = user.platform == platform.key()
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: read-only account
    pub seller: AccountInfo<'info>,

    /// mint account of chosen token
    pub payment_mint: Account<'info, Mint>,

    /// buyer's token account of chosen mint
    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Box<Account<'info, TokenAccount>>,

    /// seller's token account of chosen mint
    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = seller,
    )]
    pub seller_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: metadata program will validate
    pub mint: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub token_account: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub destination_token_account: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub metadata_token_program: Program<'info, TokenMetadata>,

    /// CHECK: metadata program will validate
    pub sysvar_instructions: AccountInfo<'info>,

    /// CHECK: metadata program will validate
    pub associated_token_program: AccountInfo<'info>,
}

pub fn sell_subscription_handler(
    ctx: Context<SellSubscription>,
    listing_starts_at: i64,
) -> Result<()> {
    let list = &mut ctx.accounts.list;

    // check if buyer has enough balance
    if ctx.accounts.buyer_token_account.amount < list.price {
        return err!(ProtocolErrors::InsufficientBalance);
    }

    let signer_seeds = [
        LIST_SEED,
        ctx.accounts.seller.key.as_ref(),
        &listing_starts_at.to_le_bytes(),
        &[*ctx.bumps.get("list").unwrap()],
    ];

    transfer_asset_with_signer(
        &ctx.accounts.metadata,
        &ctx.accounts.mint,
        &list.to_account_info(),
        &ctx.accounts.token_account,
        &list.to_account_info(),
        &ctx.accounts.destination_token_account.to_account_info(),
        &ctx.accounts.buyer,
        &ctx.accounts.buyer,
        &ctx.accounts.sysvar_instructions,
        &ctx.accounts.token_program,
        &ctx.accounts.associated_token_program,
        &signer_seeds,
    )?;

    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                authority: ctx.accounts.buyer.to_account_info(),
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
            },
            &[&signer_seeds],
        ),
        list.price,
    )?;

    list.is_claimable = true;
    list.buyer = Some(ctx.accounts.buyer.key());
    Ok(())
}
