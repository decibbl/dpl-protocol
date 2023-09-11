pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;
pub mod utils;

use crate::states::platform::SubscriptionPlan;
use mpl_token_metadata::{
    instruction::PrintArgs,
    state::{AssetData, PrintSupply},
};
use {anchor_lang::prelude::*, artist::*, artwork::*, collection::*, instructions::*, platform::*};

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
}
