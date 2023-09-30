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
} from '@metaplex-foundation/umi';
import {
  Serializer,
  array,
  mapSerializer,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';
import { AssetData, AssetDataArgs, getAssetDataSerializer } from '../types';

// Accounts.
export type CreateArtistInstructionAccounts = {
  /** artist account */
  artist: PublicKey | Pda;
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
  tokenMint: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  metadataTokenProgram: PublicKey | Pda;
  sysvarInstructions?: PublicKey | Pda;
  associatedTokenProgram: PublicKey | Pda;
};

// Data.
export type CreateArtistInstructionData = {
  discriminator: Array<number>;
  assetData: AssetData;
};

export type CreateArtistInstructionDataArgs = { assetData: AssetDataArgs };

export function getCreateArtistInstructionDataSerializer(): Serializer<
  CreateArtistInstructionDataArgs,
  CreateArtistInstructionData
> {
  return mapSerializer<
    CreateArtistInstructionDataArgs,
    any,
    CreateArtistInstructionData
  >(
    struct<CreateArtistInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['assetData', getAssetDataSerializer()],
      ],
      { description: 'CreateArtistInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [19, 246, 64, 224, 207, 250, 83, 11],
    })
  ) as Serializer<CreateArtistInstructionDataArgs, CreateArtistInstructionData>;
}

// Args.
export type CreateArtistInstructionArgs = CreateArtistInstructionDataArgs;

// Instruction.
export function createArtist(
  context: Pick<Context, 'identity' | 'programs'>,
  input: CreateArtistInstructionAccounts & CreateArtistInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'dplProtocol',
    'ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    artist: { index: 0, isWritable: true, value: input.artist ?? null },
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
    tokenMint: { index: 11, isWritable: false, value: input.tokenMint ?? null },
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
  const resolvedArgs: CreateArtistInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.authority.value) {
    resolvedAccounts.authority.value = context.identity;
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }
  if (!resolvedAccounts.tokenProgram.value) {
    resolvedAccounts.tokenProgram.value = context.programs.getPublicKey(
      'splToken',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    );
    resolvedAccounts.tokenProgram.isWritable = false;
  }
  if (!resolvedAccounts.sysvarInstructions.value) {
    resolvedAccounts.sysvarInstructions.value = publicKey(
      'Sysvar1nstructions1111111111111111111111111'
    );
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getCreateArtistInstructionDataSerializer().serialize(
    resolvedArgs as CreateArtistInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}