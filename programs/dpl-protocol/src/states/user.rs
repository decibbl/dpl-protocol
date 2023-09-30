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

    /// platform which user belongs to
    pub platform: Pubkey,

    /// subscription details
    pub subscription: SubscriptionPlanDetails,
}

#[account]
#[derive(InitSpace)]
pub struct List {
    /// authority who is listing
    pub authority: Pubkey,

    /// timestamp of when fractionalized subscription starts
    pub start_timestamp: i64,

    /// listing price
    pub price: u64,

    /// chosen token mint from platform supported tokens
    pub payment_mint: Pubkey,

    /// user token account of chosen payment mint
    pub token_account: Pubkey,

    /// minted subscriber nft
    pub mint: Pubkey,

    /// is listed nft claimable
    pub is_claimable: bool,

    pub buyer: Option<Pubkey>,
}
