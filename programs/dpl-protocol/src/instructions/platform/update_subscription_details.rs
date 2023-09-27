use anchor_lang::prelude::*;

use crate::{
    errors::ProtocolErrors,
    states::platform::{Platform, SubscriptionDetails},
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

pub fn update_subscription_details_handler(
    ctx: Context<UpdateSubscriptionPlan>,
    subscription_detail: SubscriptionDetails,
    action: Action,
) -> Result<()> {
    let platform = &mut ctx.accounts.platform;

    if platform.subscription_details.is_empty() {
        return err!(ProtocolErrors::NoSubscriptionDetails);
    }

    match action {
        Action::Update => {
            let index = platform
                .subscription_details
                .iter()
                .position(|s| s.mint == subscription_detail.mint)
                .unwrap();

            platform.subscription_details[index] = subscription_detail;
        }
        Action::Remove => {
            let index = platform
                .subscription_details
                .iter()
                .position(|s| s.mint == subscription_detail.mint)
                .unwrap();

            platform.subscription_details.remove(index);
        }
    }
    Ok(())
}
