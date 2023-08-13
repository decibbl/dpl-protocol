use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Collection {
    /// artist PDA address
    pub artist: Pubkey,

    /// non-transferable mint account
    pub mint: Pubkey,

    /// platforms the collection is part of
    #[max_len(10)]
    pub platforms: Vec<Pubkey>,
}
