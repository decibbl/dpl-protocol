use anchor_lang::prelude::*;

use crate::{
    errors::ArtistsErrors,
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
}

pub fn add_subscription_plan_handler(
    ctx: Context<AddSubscriptionPlan>,
    plan: SubscriptionPlan,
) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    require!(
        !platform.subscription_plans.iter().any(|p| p.id == plan.id),
        ArtistsErrors::SubscriptionPlanAlreadyExist
    );

    platform.subscription_plans.push(plan);
    Ok(())
}
