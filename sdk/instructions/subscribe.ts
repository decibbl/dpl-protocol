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
import {
  SubscriptionPlan,
  SubscriptionPlanArgs,
  getSubscriptionPlanSerializer,
} from '../types';

// Accounts.
export type SubscribeInstructionAccounts = {
  /** platform account */
  platform: PublicKey | Pda;
  /** user account */
  user: PublicKey | Pda;
  authority?: Signer;
  /** user's associated token account of supported mint */
  userTokenAccount: PublicKey | Pda;
  /**
   * mint account of supported token by the platform
   * under platform.supported_tokens[n].mint
   */

  supportedTokenMint: PublicKey | Pda;
  /**
   * platform's associated token account of supported mint
   * under platform.supported_tokens[n].token_account
   */

  supportedTokenAccount: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  associatedTokenProgram: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type SubscribeInstructionData = {
  discriminator: Array<number>;
  subscriptionPlan: SubscriptionPlan;
};

export type SubscribeInstructionDataArgs = {
  subscriptionPlan: SubscriptionPlanArgs;
};

export function getSubscribeInstructionDataSerializer(): Serializer<
  SubscribeInstructionDataArgs,
  SubscribeInstructionData
> {
  return mapSerializer<
    SubscribeInstructionDataArgs,
    any,
    SubscribeInstructionData
  >(
    struct<SubscribeInstructionData>(
      [
        ['discriminator', array(u8(), { size: 8 })],
        ['subscriptionPlan', getSubscriptionPlanSerializer()],
      ],
      { description: 'SubscribeInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: [254, 28, 191, 138, 156, 179, 183, 53],
    })
  ) as Serializer<SubscribeInstructionDataArgs, SubscribeInstructionData>;
}

// Args.
export type SubscribeInstructionArgs = SubscribeInstructionDataArgs;

// Instruction.
export function subscribe(
  context: Pick<Context, 'identity' | 'programs'>,
  input: SubscribeInstructionAccounts & SubscribeInstructionArgs
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
    authority: { index: 2, isWritable: true, value: input.authority ?? null },
    userTokenAccount: {
      index: 3,
      isWritable: true,
      value: input.userTokenAccount ?? null,
    },
    supportedTokenMint: {
      index: 4,
      isWritable: false,
      value: input.supportedTokenMint ?? null,
    },
    supportedTokenAccount: {
      index: 5,
      isWritable: true,
      value: input.supportedTokenAccount ?? null,
    },
    tokenProgram: {
      index: 6,
      isWritable: false,
      value: input.tokenProgram ?? null,
    },
    associatedTokenProgram: {
      index: 7,
      isWritable: false,
      value: input.associatedTokenProgram ?? null,
    },
    systemProgram: {
      index: 8,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: SubscribeInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.authority.value) {
    resolvedAccounts.authority.value = context.identity;
  }
  if (!resolvedAccounts.tokenProgram.value) {
    resolvedAccounts.tokenProgram.value = context.programs.getPublicKey(
      'splToken',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    );
    resolvedAccounts.tokenProgram.isWritable = false;
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
  const data = getSubscribeInstructionDataSerializer().serialize(
    resolvedArgs as SubscribeInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
