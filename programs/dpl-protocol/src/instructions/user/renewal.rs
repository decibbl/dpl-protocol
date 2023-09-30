use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    constants::USER_SEED,
    errors::ProtocolErrors,
    states::{
        platform::{Duration, Platform},
        user::User,
    },
};

#[derive(Accounts)]
pub struct Renewal<'info> {
    /// platform account
    pub platform: Account<'info, Platform>,

    /// user account
    #[account(mut)]
    pub user: Account<'info, User>,

    /// CHECK: read-only
    pub authority: AccountInfo<'info>,

    /// platform authority
    #[account(
        constraint=platform_authority.key == &platform.authority @ProtocolErrors::InvalidPlatformAuthority
    )]
    pub platform_authority: Signer<'info>,

    /// user's associated token account of supported mint
    #[account(
        mut,
        associated_token::mint=supported_token_mint,
        associated_token::authority=authority,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    /// mint account of supported token by the platform
    /// under platform.supported_tokens[n].mint
    pub supported_token_mint: Account<'info, Mint>,

    /// platform's associated token account of supported mint
    /// under platform.supported_tokens[n].token_account
    #[account(
        mut,
        associated_token::mint=supported_token_mint,
        associated_token::authority=platform.authority,
    )]
    pub supported_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

#[event]
pub struct RenewalEvent {
    pub data: u64,
    pub label: String,
}

pub fn renewal_handler(ctx: Context<Renewal>) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let subscription_plan = &user.subscription.subscribed_plan;

    // check if user is already subscribed
    if user.subscription.start_timestamp == 0 {
        return err!(ProtocolErrors::NotSubscribed);
    }

    // check if user has enough balance
    if ctx.accounts.user_token_account.amount < subscription_plan.price {
        emit!(RenewalEvent {
            data: 1,
            label: "InsufficientBalance".to_string(),
        });
        return err!(ProtocolErrors::InsufficientBalance);
    }

    // check if user account still has delegate authority
    if ctx.accounts.user_token_account.delegate.is_none() {
        return err!(ProtocolErrors::NoDelegateAuthority);
    }

    // check if delegate (user) can still approve subscription price
    if ctx.accounts.user_token_account.delegated_amount > subscription_plan.price {
        emit!(RenewalEvent {
            data: 1,
            label: "InsufficientDelegateBalance".to_string(),
        });
        return err!(ProtocolErrors::InsufficientDelegateBalance);
    }

    let signer_seeds = [
        USER_SEED,
        ctx.accounts.authority.key.as_ref(),
        &[*ctx.bumps.get("user").unwrap()],
    ];

    let duration: u8;

    match subscription_plan.duration {
        Duration::One => {
            duration = 1;
        }
        Duration::Four => {
            duration = 4;
        }
        Duration::Twelve => {
            duration = 12;
        }
        Duration::TwentySix => {
            duration = 26;
        }
        Duration::FiftyTwo => {
            duration = 52;
        }
    }

    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                authority: user.to_account_info(),
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.supported_token_account.to_account_info(),
            },
            &[&signer_seeds],
        ),
        subscription_plan.price,
    )?;

    let clock = Clock::get()?;
    let current_unix_timestamp = clock.unix_timestamp;

    let duration_in_epoch = i64::from(duration * 7 * 24 * 60 * 60);

    user.subscription.start_timestamp = current_unix_timestamp;
    user.subscription.end_timestamp = current_unix_timestamp
        .checked_add(duration_in_epoch)
        .unwrap();

    Ok(())
}
