use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    errors::ProtocolErrors,
    states::{
        platform::{Duration, Platform},
        user::User,
    },
};

/// in case of renewal fails due to insufficient delegate balance then user can
/// themselves approve the renewal manually, by resubscribing with new approval
#[derive(Accounts)]
pub struct ApproveRenewal<'info> {
    /// platform account
    pub platform: Account<'info, Platform>,

    /// user account
    #[account(mut)]
    pub user: Account<'info, User>,

    pub authority: Signer<'info>,

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
pub struct ApproveRenewalEvent {
    pub data: u64,
    pub label: String,
}

pub fn approve_renewal_handler(ctx: Context<ApproveRenewal>) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let subscription_plan = &user.subscription.subscribed_plan;

    // check if user is already subscribed
    if user.subscription.start_timestamp == 0 {
        return err!(ProtocolErrors::NotSubscribed);
    }

    // check if user has enough balance
    if ctx.accounts.user_token_account.amount < subscription_plan.price {
        emit!(ApproveRenewalEvent {
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
        emit!(ApproveRenewalEvent {
            data: 1,
            label: "InsufficientDelegateBalance".to_string(),
        });
        return err!(ProtocolErrors::InsufficientDelegateBalance);
    }

    // resetting the approval
    anchor_spl::token::revoke(CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        anchor_spl::token::Revoke {
            authority: ctx.accounts.authority.to_account_info(),
            source: ctx.accounts.user_token_account.to_account_info(),
        },
    ))?;

    let approval_amount;
    let duration: u8;

    // if its x Duration then take y multiples price of approval
    match subscription_plan.duration {
        Duration::One => {
            // for 1 week approve 6 months worth of amount
            approval_amount = subscription_plan
                .price
                .checked_mul(24)
                .ok_or::<Result<ProtocolErrors>>(err!(ProtocolErrors::InvalidApprovalDuration))
                .unwrap();
            duration = 1;
        }
        Duration::Four => {
            // for ~1 month approve 1 year worth of amount
            approval_amount = subscription_plan
                .price
                .checked_mul(12)
                .ok_or::<Result<ProtocolErrors>>(err!(ProtocolErrors::InvalidApprovalDuration))
                .unwrap();
            duration = 4;
        }
        Duration::Twelve => {
            // for ~3 months approve 1 year worth of amount
            approval_amount = subscription_plan
                .price
                .checked_mul(4)
                .ok_or::<Result<ProtocolErrors>>(err!(ProtocolErrors::InvalidApprovalDuration))
                .unwrap();
            duration = 12;
        }
        Duration::TwentySix => {
            // for ~6 months approve 1 year worth of amount
            approval_amount = subscription_plan
                .price
                .checked_mul(4)
                .ok_or::<Result<ProtocolErrors>>(err!(ProtocolErrors::InvalidApprovalDuration))
                .unwrap();
            duration = 26;
        }
        Duration::FiftyTwo => {
            // for ~12 months approve 2 year worth of amount
            approval_amount = subscription_plan
                .price
                .checked_mul(2)
                .ok_or::<Result<ProtocolErrors>>(err!(ProtocolErrors::InvalidApprovalDuration))
                .unwrap();
            duration = 52;
        }
    }

    anchor_spl::token::approve(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Approve {
                authority: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                delegate: user.to_account_info(),
            },
        ),
        approval_amount,
    )?;

    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                authority: ctx.accounts.authority.to_account_info(),
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.supported_token_account.to_account_info(),
            },
        ),
        subscription_plan.price,
    )?;

    let clock = Clock::get()?;
    let current_unix_timestamp = clock.unix_timestamp;

    let duration_in_epoch = i64::from(duration * 7 * 24 * 60 * 60);

    user.subscription.mint = ctx.accounts.supported_token_mint.key();
    user.subscription.start_timestamp = current_unix_timestamp;
    user.subscription.end_timestamp = current_unix_timestamp
        .checked_add(duration_in_epoch)
        .unwrap();

    Ok(())
}
