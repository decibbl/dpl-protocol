use anchor_lang::prelude::*;

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    Default,
    Debug,
    InitSpace,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
)]
pub struct SupportedToken {
    /// mint account of supported SPL Token
    pub mint: Pubkey,

    /// pool token account where
    /// royalties will be distributed
    pub token_account: Pubkey,
}

/// allowed durations (in weeks)
#[derive(
    Default,
    Debug,
    Clone,
    PartialEq,
    AnchorSerialize,
    AnchorDeserialize,
    InitSpace,
    Eq,
    PartialOrd,
    Ord,
)]
pub enum Duration {
    #[default]
    One = 1,
    Four = 4,
    Twelve = 12,
    TwentySix = 26,
    FiftyTwo = 52,
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    Default,
    Debug,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    InitSpace,
)]
pub struct SubscriptionPlan {
    /// plan id
    pub id: u8,

    /// duration (in week)
    pub duration: Duration,

    /// subscription price for selected duration
    pub price: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Platform {
    /// authority to update the account
    pub authority: Pubkey,

    /// non-transferable mint account
    pub mint: Pubkey,

    /// non-transferable mint account acts as
    /// collection NFT & verifies artist's mints
    pub artist_mint: Pubkey,

    /// non-transferable mint account acts as
    /// collection NFT & verifies user's mints
    pub user_mint: Pubkey,

    /// platform's domain address
    #[max_len(32)]
    pub domain: String,

    /// list of all supported SPL Tokens and their Token Account
    #[max_len(5)]
    pub supported_tokens: Vec<SupportedToken>,

    #[max_len(5)]
    pub subscription_plans: Vec<SubscriptionPlan>,
}
