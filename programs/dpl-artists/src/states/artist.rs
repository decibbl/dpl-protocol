use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug, InitSpace)]
pub struct PlatformDetails {
    /// platform PDA address
    pub address: Pubkey,

    /// mint account artist wishes to receive
    /// royalties in, which are supported
    /// by the above platform
    pub mint: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct Artist {
    /// authority to update the account
    pub authority: Pubkey,

    /// non-transferable mint account
    pub mint: Pubkey,

    /// platforms artist is part of
    pub platforms: PlatformDetails,
}
