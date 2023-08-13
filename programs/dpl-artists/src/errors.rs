use anchor_lang::prelude::*;

#[error_code]
pub enum ArtistsErrors {
    #[msg("Domain len too large")]
    DomainLenTooLarge,
    #[msg("Duplicate Supported Token Details")]
    DuplicateSupportedTokenDetails,
    #[msg("Subscription Plan already exist")]
    SubscriptionPlanAlreadyExist,
    #[msg("No Subscription Plans")]
    NoSubscriptionPlans,
    #[msg("Subscription Plan not found")]
    SubscriptionPlanNotFound,
}
