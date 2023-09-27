use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

use crate::{
    errors::ProtocolErrors,
    states::platform::{Platform, SubscriptionPlan},
};

#[derive(Accounts)]
pub struct AddSubscriptionPlan<'info> {
    /// platform account
    #[account(
        mut,
        has_one = authority
    )]
    pub platform: Account<'info, Platform>,

    /// update authority
    pub authority: Signer<'info>,

    /// mint account of a token that platform wants to support
    pub token_mint: Account<'info, Mint>,

    /// token account of respective mint given above
    #[account(
        associated_token::mint = token_mint,
        associated_token::authority = authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
}

pub fn add_subscription_plan_handler(
    ctx: Context<AddSubscriptionPlan>,
    plan: SubscriptionPlan,
) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    if platform.subscription_details.is_empty() {
        return err!(ProtocolErrors::NoSubscriptionDetails);
    }

    for subscription_detail in &platform.subscription_details {
        if subscription_detail.mint != ctx.accounts.token_mint.key() || subscription_detail.token_account != ctx.accounts.token_account.key() {
            return err!(ProtocolErrors::SupportedTokenNotFound)
        }
    }

    let index = platform.subscription_details.binary_search_by(|s| s.mint.cmp(&ctx.accounts.token_mint.key())).unwrap();

    platform.subscription_details[index].subscription_plans.push(plan);

    // require!(
    //     !platform.subscription_plans.iter().any(|p| p.id == plan.id),
    //     ProtocolErrors::SubscriptionPlanAlreadyExist
    // );

    // platform.subscription_plans.push(plan);
    Ok(())
}
