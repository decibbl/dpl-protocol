use anchor_lang::prelude::*;

#[error_code]
pub enum ProtocolErrors {
    // artists
    #[msg("Domain length too large")]
    DomainLenTooLarge,
    #[msg("Duplicate supported token details")]
    DuplicateSupportedTokenDetails,
    #[msg("Subscription plan already exist")]
    SubscriptionPlanAlreadyExist,
    #[msg("No subscription details found")]
    NoSubscriptionDetails,
    #[msg("Subscription plan not found")]
    SubscriptionPlanNotFound,
    #[msg("Supported token not found")]
    SupportedTokenNotFound,
    #[msg("Invalid mint")]
    InvalidMint,

    // users
    #[msg("Already subscribed")]
    AlreadySubscribed,
    #[msg("Not subscribed")]
    NotSubscribed,
    #[msg("Invalid supported token details")]
    InvalidSupportTokenDetails,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Invalid subscription plan")]
    InvalidSubscriptionPlan,
    #[msg("Invalid approval duration")]
    InvalidApprovalDuration,
    #[msg("Invalid platform authority")]
    InvalidPlatformAuthority,
    #[msg("No delegate authority")]
    NoDelegateAuthority,
    #[msg("Insufficient delegate balance")]
    InsufficientDelegateBalance,
    #[msg("Unsubscribe after current subscription end timestamp")]
    InvalidUnsubscribe,
}
