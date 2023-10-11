use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Token, Mint}, associated_token::AssociatedToken};

use crate::{states::{platform::Platform, artist::Artist}, constants::{ARTIST_SEED, PLATFORM_SEED}};

#[derive(Accounts)]
pub struct DistributeFunds<'info> {

    /// platform account
    #[account(
        seeds = [
            PLATFORM_SEED,
            platform.domain.as_bytes(),
            platform_authority.key.as_ref(),
        ],
        bump,
        constraint = platform.authority == platform_authority.key()
    )]
    pub platform: Account<'info, Platform>,

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

    /// update authority
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: 
    pub platform_authority: AccountInfo<'info>,

    /// mint account of a token that platform wants to support
    pub token_mint: Account<'info, Mint>,

    /// token account of respective mint given above
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = platform,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// token account of respective mint given above of artist
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = authority,
    )]
    pub artist_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn distribute_funds_handler(ctx: Context<DistributeFunds>, amount: u64) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    let signer_seeds = [
        PLATFORM_SEED,
        platform.domain.as_bytes(),
        ctx.accounts.platform_authority.key.as_ref(),
        &[*ctx.bumps.get("platform").unwrap()],
    ];

    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                authority: platform.to_account_info(),
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.artist_token_account.to_account_info(),
            },
            &[&signer_seeds],
        ),
        amount,
    )?;

    Ok(())
}