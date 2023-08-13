use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    errors::ArtistsErrors,
    states::platform::{Platform, SupportedToken},
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

    pub token_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = token_mint,
        associated_token::authority = authority,
    )]
    pub token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn add_supported_token_details_handler(ctx: Context<AddSupportedTokenDetails>) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    require!(
        !platform.supported_tokens.contains(&SupportedToken {
            mint: ctx.accounts.token_mint.key(),
            token_account: ctx.accounts.token_account.key(),
        }),
        ArtistsErrors::DuplicateSupportedTokenDetails
    );

    platform.supported_tokens.push(SupportedToken {
        mint: ctx.accounts.token_mint.key(),
        token_account: ctx.accounts.token_account.key(),
    });

    Ok(())
}
