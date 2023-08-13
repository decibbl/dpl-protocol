use anchor_lang::prelude::*;

use crate::{
    errors::ArtistsErrors,
    states::platform::{Platform, SubscriptionPlan},
};

#[derive(Accounts)]
pub struct UpdateSubscriptionPlan<'info> {
    /// platform account
    #[account(
        mut,
        has_one = authority
    )]
    pub platform: Account<'info, Platform>,

    /// update authority
    pub authority: Signer<'info>,
}

#[derive(Debug, PartialEq, AnchorSerialize, AnchorDeserialize)]
pub enum Action {
    Update,
    Remove,
}

pub fn update_subscription_plan_handler(
    ctx: Context<UpdateSubscriptionPlan>,
    plan: SubscriptionPlan,
    action: Action,
) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    if platform.subscription_plans.is_empty() {
        return err!(ArtistsErrors::NoSubscriptionPlans);
    }

    if !platform.subscription_plans.iter().any(|p| p.id == plan.id) {
        return err!(ArtistsErrors::SubscriptionPlanNotFound);
    }

    match action {
        Action::Update => {
            let index = platform
                .subscription_plans
                .iter()
                .position(|p| p.id == plan.id)
                .unwrap();

            platform.subscription_plans[index] = plan;
        }
        Action::Remove => {
            let index = platform
                .subscription_plans
                .iter()
                .position(|p| p.id == plan.id)
                .unwrap();

            platform.subscription_plans.remove(index);
        }
    }
    Ok(())
}
