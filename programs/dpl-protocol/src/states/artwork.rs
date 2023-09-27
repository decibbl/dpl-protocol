use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug, InitSpace)]
pub struct Uses {
    /// total number of usage till last cycle
    pub total: u64,

    /// last updated cycle - 1 cycle = 7 days
    pub last_cycle: i64,
}

#[account]
#[derive(InitSpace)]
pub struct Artwork {
    /// artist PDA address
    pub artist: Pubkey,

    /// non-transferable mint account
    pub mint: Pubkey,

    /// incremented periodically by the platform
    /// as per its requirements
    pub uses: Uses,

    /// collection PDA address if
    /// artwork is part of collection
    pub collection: Option<Pubkey>,

    /// platform addresses the artwork is part of,
    /// if artwork is part if collection
    /// i.e if above address is added then
    /// collection's platforms will take precedence
    #[max_len(10)]
    pub platforms: Vec<Pubkey>,
}
