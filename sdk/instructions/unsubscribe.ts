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

// Accounts.
export type UnsubscribeInstructionAccounts = {
  /** platform account */
  platform: PublicKey | Pda;
  /** user account */
  user: PublicKey | Pda;
  authority?: Signer;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type UnsubscribeInstructionData = { discriminator: Array<number> };

export type UnsubscribeInstructionDataArgs = {};

export function getUnsubscribeInstructionDataSerializer(): Serializer<
  UnsubscribeInstructionDataArgs,
  UnsubscribeInstructionData
> {
  return mapSerializer<
    UnsubscribeInstructionDataArgs,
    any,
    UnsubscribeInstructionData
  >(
    struct<UnsubscribeInstructionData>(
      [['discriminator', array(u8(), { size: 8 })]],
      { description: 'UnsubscribeInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [12, 90, 197, 207, 214, 187, 199, 198],
    })
  ) as Serializer<UnsubscribeInstructionDataArgs, UnsubscribeInstructionData>;
}

// Instruction.
export function unsubscribe(
  context: Pick<Context, 'identity' | 'programs'>,
  input: UnsubscribeInstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'dplProtocol',
    'ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    platform: { index: 0, isWritable: false, value: input.platform ?? null },
    user: { index: 1, isWritable: true, value: input.user ?? null },
    authority: { index: 2, isWritable: false, value: input.authority ?? null },
    systemProgram: {
      index: 3,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
  };

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
  const data = getUnsubscribeInstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
