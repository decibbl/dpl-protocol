use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct Creator {
    #[cfg_attr(feature = "serde-feature", serde(with = "As::<DisplayFromStr>"))]
    pub address: Pubkey,
    pub verified: bool,
    // In percentages, NOT basis points ;) Watch out!
    pub share: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone, Copy)]
pub enum TokenStandard {
    NonFungible,                    // This is a master edition
    FungibleAsset,                  // A token with metadata that can also have attributes
    Fungible,                       // A token with simple metadata
    NonFungibleEdition,             // This is a limited edition
    ProgrammableNonFungible,        // NonFungible with programmable configuration
    ProgrammableNonFungibleEdition, // NonFungible with programmable configuration
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct MCollection {
    pub verified: bool,
    #[cfg_attr(feature = "serde-feature", serde(with = "As::<DisplayFromStr>"))]
    pub key: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum CollectionDetails {
    // #[deprecated(
    //     since = "1.13.1",
    //     note = "The collection size tracking feature is deprecated and will soon be removed."
    // )]
    V1 { size: u64 },
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum UseMethod {
    Burn,
    Multiple,
    Single,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct MUses {
    // 17 bytes + Option byte
    pub use_method: UseMethod, //1
    pub remaining: u64,        //8
    pub total: u64,            //8
}

/// Data representation of an asset.
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AssetData {
    /// The name of the asset.
    pub name: String,
    /// The symbol for the asset.
    pub symbol: String,
    /// URI pointing to JSON representing the asset.
    pub uri: String,
    /// Royalty basis points that goes to creators in secondary sales (0-10000).
    pub seller_fee_basis_points: u16,
    /// Array of creators.
    pub creators: Option<Vec<Creator>>,
    // Immutable, once flipped, all sales of this metadata are considered secondary.
    pub primary_sale_happened: bool,
    // Whether or not the data struct is mutable (default is not).
    pub is_mutable: bool,
    /// Type of the token.
    pub token_standard: TokenStandard,
    /// Collection information.
    pub collection: Option<MCollection>,
    /// Uses information.
    pub uses: Option<MUses>,
    /// Collection item details.
    pub collection_details: Option<CollectionDetails>,
    /// Programmable rule set for the asset.
    #[cfg_attr(
        feature = "serde-feature",
        serde(
            deserialize_with = "deser_option_pubkey",
            serialize_with = "ser_option_pubkey"
        )
    )]
    pub rule_set: Option<Pubkey>,
}

/// Represents the print supply of a non-fungible asset.
#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum PrintSupply {
    /// The asset does not have any prints.
    Zero,
    /// The asset has a limited amount of prints.
    Limited(u64),
    /// The asset has an unlimited amount of prints.
    Unlimited,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum PrintArgs {
    V1 { edition: u64 },
}
