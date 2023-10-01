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
export type CreateUserInstructionAccounts = {
  /** user account */
  user: PublicKey | Pda;
  /** platform account */
  platform: PublicKey | Pda;
  authority?: Signer;
  mint: Signer;
  tokenAccount: PublicKey | Pda;
  metadata: PublicKey | Pda;
  masterEdition: PublicKey | Pda;
  collectionAuthority: PublicKey | Pda;
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
export type CreateUserInstructionData = {
  discriminator: Array<number>;
  assetData: AssetData;
};

export type CreateUserInstructionDataArgs = { assetData: AssetDataArgs };

export function getCreateUserInstructionDataSerializer(): Serializer<
  CreateUserInstructionDataArgs,
  CreateUserInstructionData
> {
  return mapSerializer<
    CreateUserInstructionDataArgs,
    any,
    CreateUserInstructionData
  >(
    struct<CreateUserInstructionData>(
      [
        ["discriminator", array(u8(), { size: 8 })],
        ["assetData", getAssetDataSerializer()],
      ],
      { description: "CreateUserInstructionData" }
    ),
    (value) => ({
      ...value,
      discriminator: [108, 227, 130, 130, 252, 109, 75, 218],
    })
  ) as Serializer<CreateUserInstructionDataArgs, CreateUserInstructionData>;
}

// Args.
export type CreateUserInstructionArgs = CreateUserInstructionDataArgs;

// Instruction.
export function createUser(
  context: Pick<Context, "identity" | "programs">,
  input: CreateUserInstructionAccounts & CreateUserInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    "dplProtocol",
    "ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art"
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    user: { index: 0, isWritable: true, value: input.user ?? null },
    platform: { index: 1, isWritable: true, value: input.platform ?? null },
    authority: { index: 2, isWritable: true, value: input.authority ?? null },
    mint: { index: 3, isWritable: true, value: input.mint ?? null },
    tokenAccount: {
      index: 4,
      isWritable: true,
      value: input.tokenAccount ?? null,
    },
    metadata: { index: 5, isWritable: true, value: input.metadata ?? null },
    masterEdition: {
      index: 6,
      isWritable: true,
      value: input.masterEdition ?? null,
    },
    collectionAuthority: {
      index: 7,
      isWritable: true,
      value: input.collectionAuthority ?? null,
    },
    collectionMint: {
      index: 8,
      isWritable: true,
      value: input.collectionMint ?? null,
    },
    collectionMetadata: {
      index: 9,
      isWritable: true,
      value: input.collectionMetadata ?? null,
    },
    collectionMasterEdition: {
      index: 10,
      isWritable: true,
      value: input.collectionMasterEdition ?? null,
    },
    systemProgram: {
      index: 11,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
    tokenProgram: {
      index: 12,
      isWritable: false,
      value: input.tokenProgram ?? null,
    },
    metadataTokenProgram: {
      index: 13,
      isWritable: false,
      value: input.metadataTokenProgram ?? null,
    },
    sysvarInstructions: {
      index: 14,
      isWritable: false,
      value: input.sysvarInstructions ?? null,
    },
    associatedTokenProgram: {
      index: 15,
      isWritable: false,
      value: input.associatedTokenProgram ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: CreateUserInstructionArgs = { ...input };

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
  const data = getCreateUserInstructionDataSerializer().serialize(
    resolvedArgs as CreateUserInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
