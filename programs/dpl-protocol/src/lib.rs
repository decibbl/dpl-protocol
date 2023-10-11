pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;
pub mod utils;

use crate::states::platform::{SubscriptionDetails, SubscriptionPlan};
use mpl_token_metadata::{
    instruction::PrintArgs,
    state::{AssetData, PrintSupply},
};
use {
    anchor_lang::prelude::*, artist::*, artwork::*, collection::*, instructions::*, platform::*,
    user::*,
};

declare_id!("ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art");

#[program]
pub mod dpl_protocol {

    use super::*;

    // platform
    pub fn create_platform(
        ctx: Context<CreatePlatform>,
        domain: String,
        asset_data: AssetData,
    ) -> Result<()> {
        platform::create_platform_handler(ctx, domain, asset_data)
    }

    pub fn create_and_add_artist_mint(
        ctx: Context<CreateAndAddArtistMint>,
        asset_data: AssetData,
    ) -> Result<()> {
        platform::create_and_add_artist_mint_handler(ctx, asset_data)
    }

    pub fn create_and_add_user_mint(
        ctx: Context<CreateAndAddUserMint>,
        asset_data: AssetData,
    ) -> Result<()> {
        platform::create_and_add_user_mint_handler(ctx, asset_data)
    }

    pub fn add_supported_token_details(ctx: Context<AddSupportedTokenDetails>) -> Result<()> {
        platform::add_supported_token_details_handler(ctx)
    }

    pub fn add_subscription_plan(
        ctx: Context<AddSubscriptionPlan>,
        plan: SubscriptionPlan,
    ) -> Result<()> {
        platform::add_subscription_plan_handler(ctx, plan)
    }

    pub fn update_subscription_details(
        ctx: Context<UpdateSubscriptionPlan>,
        subscription_detail: SubscriptionDetails,
        action: Action,
    ) -> Result<()> {
        platform::update_subscription_details_handler(ctx, subscription_detail, action)
    }

    pub fn distribute_funds(ctx: Context<DistributeFunds>, amount: u64) -> Result<()> {
        platform::distribute_funds_handler(ctx, amount)
    }

    // artist
    pub fn create_artist(ctx: Context<CreateArtist>, asset_data: AssetData) -> Result<()> {
        artist::create_artist_handler(ctx, asset_data)
    }

    pub fn create_collection(ctx: Context<CreateCollection>, asset_data: AssetData) -> Result<()> {
        collection::create_collection_handler(ctx, asset_data)
    }

    pub fn create_artwork(
        ctx: Context<CreateArtwork>,
        asset_data: AssetData,
        is_collection: bool,
        print_supply: PrintSupply,
    ) -> Result<()> {
        artwork::create_artwork_handler(ctx, asset_data, is_collection, print_supply)
    }

    pub fn print_artwork(ctx: Context<PrintEdition>, print_args: PrintArgs) -> Result<()> {
        artwork::print_artwork_handler(ctx, print_args)
    }

    // user
    pub fn create_user(ctx: Context<CreateUser>, asset_data: AssetData) -> Result<()> {
        user::create_user_handler(ctx, asset_data)
    }

    pub fn subscribe(ctx: Context<Subscribe>, subscription_plan: SubscriptionPlan) -> Result<()> {
        user::subscribe_handler(ctx, subscription_plan)
    }

    pub fn renewal(ctx: Context<Renewal>) -> Result<()> {
        user::renewal_handler(ctx)
    }

    pub fn unsubscribe(ctx: Context<Unsubscribe>) -> Result<()> {
        user::unsubscribe_handler(ctx)
    }

    // TODO: Need more improvements
    pub fn approve_renewal(ctx: Context<ApproveRenewal>) -> Result<()> {
        user::approve_renewal_handler(ctx)
    }

    // user: marketplace
    pub fn list_subscription(
        ctx: Context<ListSubscription>,
        listing_starts_at: i64,
        price: u64,
        asset_data: AssetData,
    ) -> Result<()> {
        user::list_subscription_handler(ctx, listing_starts_at, price, asset_data)
    }

    pub fn delist_subscription(
        ctx: Context<DelistSubscription>,
        listing_starts_at: i64,
    ) -> Result<()> {
        user::delist_subscription_handler(ctx, listing_starts_at)
    }

    pub fn sell_subscription(ctx: Context<SellSubscription>, listing_starts_at: i64) -> Result<()> {
        user::sell_subscription_handler(ctx, listing_starts_at)
    }

    pub fn claim_subscription(
        ctx: Context<ClaimSubscription>,
        listing_starts_at: i64,
    ) -> Result<()> {
        user::claim_subscription_handler(ctx, listing_starts_at)
    }
}
