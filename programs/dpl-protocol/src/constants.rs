use anchor_lang::prelude::*;

#[constant]
pub const PLATFORM_SEED: &[u8] = b"platform";

#[constant]
pub const MAX_DOMAIN_LEN: usize = 32;

#[constant]
pub const ARTIST_SEED: &[u8] = b"artist";

#[constant]
pub const COLLECTION_SEED: &[u8] = b"collection";

#[constant]
pub const ARTWORK_SEED: &[u8] = b"artwork";

#[constant]
pub const USER_SEED: &[u8] = b"user";

#[constant]
pub const LIST_SEED: &[u8] = b"list";
