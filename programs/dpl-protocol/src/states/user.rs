use anchor_lang::prelude::*;

use super::platform::SubscriptionPlan;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug, InitSpace)]
pub struct SubscriptionPlanDetails {
    /// mint account of a token used to subscribe
    pub mint: Pubkey,

    /// subscribed plan
    pub subscribed_plan: SubscriptionPlan,

    /// start date of subscription
    pub start_timestamp: i64,

    /// end date of subscription
    pub end_timestamp: i64,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    /// authority to update the account
    pub authority: Pubkey,

    /// non-transferable mint account
    pub mint: Pubkey,

    /// subscription details
    pub subscription: SubscriptionPlanDetails,
}
