use anchor_lang::{
    prelude::*,
    solana_program::program::{invoke, invoke_signed},
};
use mpl_token_metadata::{
    instruction::{
        builders::{CreateBuilder, DelegateBuilder, LockBuilder, MintBuilder, VerifyBuilder},
        CreateArgs, DelegateArgs, InstructionBuilder, LockArgs, MintArgs, VerificationArgs,
    },
    state::{AssetData, PrintSupply},
};

#[derive(Clone)]
pub struct TokenMetadata;

impl anchor_lang::Id for TokenMetadata {
    fn id() -> Pubkey {
        mpl_token_metadata::id()
    }
}

pub fn mint_asset<'info>(
    asset_data: AssetData,
    metadata: &AccountInfo<'info>,
    master_edition: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    authority: &AccountInfo<'info>,
    update_authority: &AccountInfo<'info>,
    token_account: &AccountInfo<'info>,
    token_owner: &AccountInfo<'info>,
    payer: &AccountInfo<'info>,
    sysvar_instructions: &AccountInfo<'info>,
    token_program: &AccountInfo<'info>,
) -> Result<()> {
    let create_ix = CreateBuilder::new()
        .metadata(metadata.key())
        .master_edition(master_edition.key())
        .mint(mint.key())
        .authority(authority.key())
        .update_authority(update_authority.key())
        .initialize_mint(true)
        .update_authority_as_signer(true)
        .payer(payer.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .build(CreateArgs::V1 {
            asset_data,
            decimals: Some(0),
            print_supply: Some(PrintSupply::Zero),
        })
        .unwrap()
        .instruction();

    invoke(
        &create_ix,
        &[
            metadata.clone(),
            master_edition.clone(),
            mint.clone(),
            authority.clone(),
            update_authority.clone(),
            payer.clone(),
            sysvar_instructions.clone(),
            token_program.clone(),
        ],
    )?;

    let mint_ix = MintBuilder::new()
        .token(token_account.key())
        .token_owner(token_owner.key())
        .metadata(metadata.key())
        .master_edition(master_edition.key())
        .mint(mint.key())
        .authority(authority.key())
        .payer(payer.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .build(MintArgs::V1 {
            amount: 1,
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    invoke(
        &mint_ix,
        &[
            token_account.clone(),
            token_owner.clone(),
            metadata.clone(),
            master_edition.clone(),
            mint.clone(),
            authority.clone(),
            payer.clone(),
            sysvar_instructions.clone(),
            token_program.clone(),
        ],
    )?;

    let delegate_ix = DelegateBuilder::new()
        .delegate(authority.key())
        .metadata(metadata.key())
        .master_edition(master_edition.key())
        .mint(mint.key())
        .token(token_account.key())
        .authority(authority.key())
        .payer(payer.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .build(DelegateArgs::StandardV1 { amount: 1 })
        .unwrap()
        .instruction();

    invoke(
        &delegate_ix,
        &[
            authority.clone(),
            metadata.clone(),
            master_edition.clone(),
            mint.clone(),
            token_account.clone(),
            authority.clone(),
            payer.clone(),
            sysvar_instructions.clone(),
            token_program.clone(),
        ],
    )?;

    let lock_ix = LockBuilder::new()
        .authority(authority.key())
        .token_owner(token_owner.key())
        .token(token_account.key())
        .mint(mint.key())
        .metadata(metadata.key())
        .edition(master_edition.key())
        .payer(payer.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .build(LockArgs::V1 {
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    invoke(
        &lock_ix,
        &[
            authority.clone(),
            token_owner.clone(),
            token_account.clone(),
            mint.clone(),
            metadata.clone(),
            master_edition.clone(),
            payer.clone(),
            sysvar_instructions.clone(),
            token_program.clone(),
        ],
    )?;

    Ok(())
}

pub fn mint_asset_with_signer<'info>(
    asset_data: AssetData,
    metadata: &AccountInfo<'info>,
    master_edition: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    authority: &AccountInfo<'info>,
    update_authority: &AccountInfo<'info>,
    token_account: &AccountInfo<'info>,
    token_owner: &AccountInfo<'info>,
    payer: &AccountInfo<'info>,
    sysvar_instructions: &AccountInfo<'info>,
    token_program: &AccountInfo<'info>,
    collection_mint: &AccountInfo<'info>,
    collection_metadata: &AccountInfo<'info>,
    collection_master_edition: &AccountInfo<'info>,
    collection_authority: &AccountInfo<'info>,
    signer_seeds: &[&[u8]],
) -> Result<()> {
    let create_ix = CreateBuilder::new()
        .metadata(metadata.key())
        .master_edition(master_edition.key())
        .mint(mint.key())
        .authority(authority.key())
        .update_authority(update_authority.key())
        .initialize_mint(true)
        .update_authority_as_signer(true)
        .payer(payer.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .build(CreateArgs::V1 {
            asset_data: asset_data.clone(),
            decimals: Some(0),
            print_supply: Some(PrintSupply::Zero),
        })
        .unwrap()
        .instruction();

    invoke_signed(
        &create_ix,
        &[
            metadata.clone(),
            master_edition.clone(),
            mint.clone(),
            authority.clone(),
            update_authority.clone(),
            payer.clone(),
            sysvar_instructions.clone(),
            token_program.clone(),
        ],
        &[signer_seeds],
    )?;

    let mint_ix = MintBuilder::new()
        .token(token_account.key())
        .token_owner(token_owner.key())
        .metadata(metadata.key())
        .master_edition(master_edition.key())
        .mint(mint.key())
        .authority(authority.key())
        .payer(payer.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .build(MintArgs::V1 {
            amount: 1,
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    invoke_signed(
        &mint_ix,
        &[
            token_account.clone(),
            token_owner.clone(),
            metadata.clone(),
            master_edition.clone(),
            mint.clone(),
            authority.clone(),
            payer.clone(),
            sysvar_instructions.clone(),
            token_program.clone(),
        ],
        &[signer_seeds],
    )?;

    if !asset_data.creators.unwrap()[0].verified {
        let verify_creator_ix = VerifyBuilder::new()
            .authority(collection_authority.key())
            .metadata(metadata.key())
            .collection_mint(collection_mint.key())
            .collection_metadata(collection_metadata.key())
            .collection_master_edition(collection_master_edition.key())
            .sysvar_instructions(sysvar_instructions.key())
            .build(VerificationArgs::CreatorV1)
            .unwrap()
            .instruction();

        invoke_signed(
            &verify_creator_ix,
            &[
                collection_authority.clone(),
                metadata.clone(),
                collection_mint.clone(),
                collection_metadata.clone(),
                collection_master_edition.clone(),
                sysvar_instructions.clone(),
            ],
            &[signer_seeds],
        )?;
    }

    let verify_collection_ix = VerifyBuilder::new()
        .authority(collection_authority.key())
        .metadata(metadata.key())
        .collection_mint(collection_mint.key())
        .collection_metadata(collection_metadata.key())
        .collection_master_edition(collection_master_edition.key())
        .sysvar_instructions(sysvar_instructions.key())
        .build(VerificationArgs::CollectionV1)
        .unwrap()
        .instruction();

    invoke_signed(
        &verify_collection_ix,
        &[
            collection_authority.clone(),
            metadata.clone(),
            collection_mint.clone(),
            collection_metadata.clone(),
            collection_master_edition.clone(),
            sysvar_instructions.clone(),
        ],
        &[signer_seeds],
    )?;

    let delegate_ix = DelegateBuilder::new()
        .delegate(authority.key())
        .metadata(metadata.key())
        .master_edition(master_edition.key())
        .mint(mint.key())
        .token(token_account.key())
        .authority(token_owner.key())
        .payer(payer.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .build(DelegateArgs::StandardV1 { amount: 1 })
        .unwrap()
        .instruction();

    invoke_signed(
        &delegate_ix,
        &[
            authority.clone(),
            metadata.clone(),
            master_edition.clone(),
            mint.clone(),
            token_account.clone(),
            token_owner.clone(),
            payer.clone(),
            sysvar_instructions.clone(),
            token_program.clone(),
        ],
        &[signer_seeds],
    )?;

    let lock_ix = LockBuilder::new()
        .authority(authority.key())
        .token_owner(token_owner.key())
        .token(token_account.key())
        .mint(mint.key())
        .metadata(metadata.key())
        .edition(master_edition.key())
        .payer(payer.key())
        .sysvar_instructions(sysvar_instructions.key())
        .spl_token_program(token_program.key())
        .build(LockArgs::V1 {
            authorization_data: None,
        })
        .unwrap()
        .instruction();

    invoke_signed(
        &lock_ix,
        &[
            authority.clone(),
            token_owner.clone(),
            token_account.clone(),
            mint.clone(),
            metadata.clone(),
            master_edition.clone(),
            payer.clone(),
            sysvar_instructions.clone(),
            token_program.clone(),
        ],
        &[signer_seeds],
    )?;

    Ok(())
}
