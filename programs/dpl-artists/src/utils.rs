use anchor_lang::{
    prelude::*,
    solana_program::program::{invoke, invoke_signed},
};
use mpl_token_metadata::{
    instruction::{
        builders::{
            CreateBuilder, DelegateBuilder, LockBuilder, MintBuilder, PrintBuilder, VerifyBuilder,
        },
        CreateArgs, DelegateArgs, InstructionBuilder, LockArgs, MintArgs, PrintArgs,
        VerificationArgs,
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
    print_supply: Option<PrintSupply>,
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
            print_supply,
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

pub fn print_asset_with_signer<'info>(
    edition_metadata: &AccountInfo<'info>,
    edition: &AccountInfo<'info>,
    edition_mint: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
    edition_token_account: &AccountInfo<'info>,
    edition_mint_authority: &AccountInfo<'info>,
    master_edition: &AccountInfo<'info>,
    edition_marker_pda: &AccountInfo<'info>,
    payer: &AccountInfo<'info>,
    authority: &AccountInfo<'info>,
    master_token_account: &AccountInfo<'info>,
    master_metadata: &AccountInfo<'info>,
    update_authority: &AccountInfo<'info>,
    token_program: &AccountInfo<'info>,
    associated_token_program: &AccountInfo<'info>,
    sysvar_instructions: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    signer_seeds: &[&[u8]],
    print_args: PrintArgs,
) -> Result<()> {
    let print_ix = PrintBuilder::new()
        .edition_metadata(edition_metadata.key())
        .edition(edition.key())
        .edition_mint(edition_mint.key())
        .edition_token_account_owner(owner.key())
        .edition_token_account(edition_token_account.key())
        .edition_mint_authority(edition_mint_authority.key())
        .master_edition(master_edition.key())
        .edition_marker_pda(edition_marker_pda.key())
        .payer(authority.key())
        .master_token_account_owner(authority.key())
        .master_token_account(master_token_account.key())
        .master_metadata(master_metadata.key())
        .update_authority(update_authority.key())
        .spl_token_program(token_program.key())
        .spl_ata_program(associated_token_program.key())
        .sysvar_instructions(sysvar_instructions.key())
        .system_program(system_program.key())
        .initialize_mint(true)
        .build(print_args.clone())
        .unwrap()
        .instruction();

    invoke_signed(
        &print_ix,
        &[
            edition_metadata.clone(),
            edition.clone(),
            edition_mint.clone(),
            owner.clone(),
            edition_token_account.clone(),
            edition_mint_authority.clone(),
            master_edition.clone(),
            edition_marker_pda.clone(),
            payer.clone(),
            authority.clone(),
            master_token_account.clone(),
            master_metadata.clone(),
            update_authority.clone(),
            token_program.clone(),
            associated_token_program.clone(),
            sysvar_instructions.clone(),
            system_program.clone(),
        ],
        &[signer_seeds],
    )?;

    Ok(())
}
