use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    errors::ProtocolErrors,
    states::platform::{Platform, SubscriptionDetails},
};

#[derive(Accounts)]
pub struct AddSupportedTokenDetails<'info> {
    /// platform account
    #[account(
        mut,
        has_one = authority,
    )]
    pub platform: Account<'info, Platform>,

    /// update authority
    #[account(mut)]
    pub authority: Signer<'info>,

    /// mint account of a token that platform wants to support
    pub token_mint: Account<'info, Mint>,

    /// token account of respective mint given above
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = token_mint,
        associated_token::authority = platform,
    )]
    pub token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn add_supported_token_details_handler(ctx: Context<AddSupportedTokenDetails>) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    for subscription_detail in &platform.subscription_details {
        if subscription_detail.mint == ctx.accounts.token_mint.key()
            || subscription_detail.token_account == ctx.accounts.token_account.key()
        {
            return err!(ProtocolErrors::DuplicateSupportedTokenDetails);
        }
    }

    platform.subscription_details.push(SubscriptionDetails {
        mint: ctx.accounts.token_mint.key(),
        token_account: ctx.accounts.token_account.key(),
        decimals: ctx.accounts.token_mint.decimals,
        ..Default::default()
    });

    // require!(
    //     !platform.supported_tokens.contains(&SupportedToken {
    //         mint: ctx.accounts.token_mint.key(),
    //         token_account: ctx.accounts.token_account.key(),
    //     }),
    //     ProtocolErrors::DuplicateSupportedTokenDetails
    // );

    // platform.supported_tokens.push(SupportedToken {
    //     mint: ctx.accounts.token_mint.key(),
    //     token_account: ctx.accounts.token_account.key(),
    // });

    Ok(())
}
