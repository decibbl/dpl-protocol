/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  publicKey,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import {
  Serializer,
  array,
  mapSerializer,
  struct,
  u8,
} from "@metaplex-foundation/umi/serializers";
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from "../shared";
import { AssetData, AssetDataArgs, getAssetDataSerializer } from "../types";

// Accounts.
export type CreateAndAddArtistMintInstructionAccounts = {
  /** platform account */
  platform: PublicKey | Pda;
  /** update authority */
  authority?: Signer;
  /**
   * mint account for artist's NFT which
   * is owned by platform PDA
   */

  mint: Signer;
  /**
   * token account for artist's NFT which
   * is owned by platform PDA
   */

  tokenAccount: PublicKey | Pda;
  metadata: PublicKey | Pda;
  masterEdition: PublicKey | Pda;
  collectionMint: PublicKey | Pda;
  collectionMetadata: PublicKey | Pda;
  collectionMasterEdition: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  metadataTokenProgram: PublicKey | Pda;
  sysvarInstructions?: PublicKey | Pda;
  associatedTokenProgram: PublicKey | Pda;
};

// Data.
export type CreateAndAddArtistMintInstructionData = {
  discriminator: Array<number>;
  assetData: AssetData;
};

export type CreateAndAddArtistMintInstructionDataArgs = {
  assetData: AssetDataArgs;
};

export function getCreateAndAddArtistMintInstructionDataSerializer(): Serializer<
  CreateAndAddArtistMintInstructionDataArgs,
  CreateAndAddArtistMintInstructionData
> {
  return mapSerializer<
    CreateAndAddArtistMintInstructionDataArgs,
    any,
    CreateAndAddArtistMintInstructionData
  >(
    struct<CreateAndAddArtistMintInstructionData>(
      [
        ["discriminator", array(u8(), { size: 8 })],
        ["assetData", getAssetDataSerializer()],
      ],
      { description: "CreateAndAddArtistMintInstructionData" }
    ),
    (value) => ({
      ...value,
      discriminator: [21, 124, 200, 4, 111, 224, 169, 18],
    })
  ) as Serializer<
    CreateAndAddArtistMintInstructionDataArgs,
    CreateAndAddArtistMintInstructionData
  >;
}

// Args.
export type CreateAndAddArtistMintInstructionArgs =
  CreateAndAddArtistMintInstructionDataArgs;

// Instruction.
export function createAndAddArtistMint(
  context: Pick<Context, "identity" | "programs">,
  input: CreateAndAddArtistMintInstructionAccounts &
    CreateAndAddArtistMintInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    "dplProtocol",
    "ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art"
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    platform: { index: 0, isWritable: true, value: input.platform ?? null },
    authority: { index: 1, isWritable: true, value: input.authority ?? null },
    mint: { index: 2, isWritable: true, value: input.mint ?? null },
    tokenAccount: {
      index: 3,
      isWritable: true,
      value: input.tokenAccount ?? null,
    },
    metadata: { index: 4, isWritable: true, value: input.metadata ?? null },
    masterEdition: {
      index: 5,
      isWritable: true,
      value: input.masterEdition ?? null,
    },
    collectionMint: {
      index: 6,
      isWritable: true,
      value: input.collectionMint ?? null,
    },
    collectionMetadata: {
      index: 7,
      isWritable: true,
      value: input.collectionMetadata ?? null,
    },
    collectionMasterEdition: {
      index: 8,
      isWritable: true,
      value: input.collectionMasterEdition ?? null,
    },
    systemProgram: {
      index: 9,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
    tokenProgram: {
      index: 10,
      isWritable: false,
      value: input.tokenProgram ?? null,
    },
    metadataTokenProgram: {
      index: 11,
      isWritable: false,
      value: input.metadataTokenProgram ?? null,
    },
    sysvarInstructions: {
      index: 12,
      isWritable: false,
      value: input.sysvarInstructions ?? null,
    },
    associatedTokenProgram: {
      index: 13,
      isWritable: false,
      value: input.associatedTokenProgram ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: CreateAndAddArtistMintInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.authority.value) {
    resolvedAccounts.authority.value = context.identity;
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      "splSystem",
      "11111111111111111111111111111111"
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }
  if (!resolvedAccounts.tokenProgram.value) {
    resolvedAccounts.tokenProgram.value = context.programs.getPublicKey(
      "splToken",
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    );
    resolvedAccounts.tokenProgram.isWritable = false;
  }
  if (!resolvedAccounts.sysvarInstructions.value) {
    resolvedAccounts.sysvarInstructions.value = publicKey(
      "Sysvar1nstructions1111111111111111111111111"
    );
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    "programId",
    programId
  );

  // Data.
  const data = getCreateAndAddArtistMintInstructionDataSerializer().serialize(
    resolvedArgs as CreateAndAddArtistMintInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
