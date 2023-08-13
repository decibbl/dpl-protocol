pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;
pub mod utils;

// use {anchor_lang::prelude::*, instructions::*, platform::*, collection::*, artwork::*};
use crate::states::platform::SubscriptionPlan;
use mpl_token_metadata::state::AssetData;
use {anchor_lang::prelude::*, instructions::*, platform::*};

declare_id!("ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art");

#[program]
pub mod dpl_artists {

    use super::*;

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

    pub fn update_subscription_plan(
        ctx: Context<UpdateSubscriptionPlan>,
        plan: SubscriptionPlan,
        action: Action,
    ) -> Result<()> {
        platform::update_subscription_plan_handler(ctx, plan, action)
    }
}
