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
  bool,
  mapSerializer,
  struct,
  u8,
} from "@metaplex-foundation/umi/serializers";
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from "../shared";
import {
  AssetData,
  AssetDataArgs,
  PrintSupply,
  PrintSupplyArgs,
  getAssetDataSerializer,
  getPrintSupplySerializer,
} from "../types";

// Accounts.
export type CreateArtworkInstructionAccounts = {
  /** artwork account */
  artwork: PublicKey | Pda;
  /** collection account */
  collection?: PublicKey | Pda;
  /** artist account */
  artist: PublicKey | Pda;
  /** platform account */
  platform: PublicKey | Pda;
  authority?: Signer;
  mint: Signer;
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
export type CreateArtworkInstructionData = {
  discriminator: Array<number>;
  assetData: AssetData;
  isCollection: boolean;
  printSupply: PrintSupply;
};

export type CreateArtworkInstructionDataArgs = {
  assetData: AssetDataArgs;
  isCollection: boolean;
  printSupply: PrintSupplyArgs;
};

export function getCreateArtworkInstructionDataSerializer(): Serializer<
  CreateArtworkInstructionDataArgs,
  CreateArtworkInstructionData
> {
  return mapSerializer<
    CreateArtworkInstructionDataArgs,
    any,
    CreateArtworkInstructionData
  >(
    struct<CreateArtworkInstructionData>(
      [
        ["discriminator", array(u8(), { size: 8 })],
        ["assetData", getAssetDataSerializer()],
        ["isCollection", bool()],
        ["printSupply", getPrintSupplySerializer()],
      ],
      { description: "CreateArtworkInstructionData" }
    ),
    (value) => ({
      ...value,
      discriminator: [132, 77, 236, 47, 144, 183, 118, 36],
    })
  ) as Serializer<
    CreateArtworkInstructionDataArgs,
    CreateArtworkInstructionData
  >;
}

// Args.
export type CreateArtworkInstructionArgs = CreateArtworkInstructionDataArgs;

// Instruction.
export function createArtwork(
  context: Pick<Context, "identity" | "programs">,
  input: CreateArtworkInstructionAccounts & CreateArtworkInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    "dplProtocol",
    "ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art"
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    artwork: { index: 0, isWritable: true, value: input.artwork ?? null },
    collection: {
      index: 1,
      isWritable: false,
      value: input.collection ?? null,
    },
    artist: { index: 2, isWritable: false, value: input.artist ?? null },
    platform: { index: 3, isWritable: false, value: input.platform ?? null },
    authority: { index: 4, isWritable: true, value: input.authority ?? null },
    mint: { index: 5, isWritable: true, value: input.mint ?? null },
    tokenAccount: {
      index: 6,
      isWritable: true,
      value: input.tokenAccount ?? null,
    },
    metadata: { index: 7, isWritable: true, value: input.metadata ?? null },
    masterEdition: {
      index: 8,
      isWritable: true,
      value: input.masterEdition ?? null,
    },
    collectionMint: {
      index: 9,
      isWritable: true,
      value: input.collectionMint ?? null,
    },
    collectionMetadata: {
      index: 10,
      isWritable: true,
      value: input.collectionMetadata ?? null,
    },
    collectionMasterEdition: {
      index: 11,
      isWritable: true,
      value: input.collectionMasterEdition ?? null,
    },
    systemProgram: {
      index: 12,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
    tokenProgram: {
      index: 13,
      isWritable: false,
      value: input.tokenProgram ?? null,
    },
    metadataTokenProgram: {
      index: 14,
      isWritable: false,
      value: input.metadataTokenProgram ?? null,
    },
    sysvarInstructions: {
      index: 15,
      isWritable: false,
      value: input.sysvarInstructions ?? null,
    },
    associatedTokenProgram: {
      index: 16,
      isWritable: false,
      value: input.associatedTokenProgram ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: CreateArtworkInstructionArgs = { ...input };

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
  const data = getCreateArtworkInstructionDataSerializer().serialize(
    resolvedArgs as CreateArtworkInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}