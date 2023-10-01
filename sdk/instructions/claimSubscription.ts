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
  i64,
  mapSerializer,
  struct,
  u8,
} from "@metaplex-foundation/umi/serializers";
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from "../shared";

// Accounts.
export type ClaimSubscriptionInstructionAccounts = {
  /** list account */
  list: PublicKey | Pda;
  /** platform account */
  platform: PublicKey | Pda;
  /** user account of buyer */
  user: PublicKey | Pda;
  buyer: Signer;
  seller: PublicKey | Pda;
  mint: PublicKey | Pda;
  tokenAccount: PublicKey | Pda;
  metadata: PublicKey | Pda;
  masterEdition: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
  metadataTokenProgram: PublicKey | Pda;
  sysvarInstructions?: PublicKey | Pda;
  associatedTokenProgram: PublicKey | Pda;
};

// Data.
export type ClaimSubscriptionInstructionData = {
  discriminator: Array<number>;
  listingStartsAt: bigint;
};

export type ClaimSubscriptionInstructionDataArgs = {
  listingStartsAt: number | bigint;
};

export function getClaimSubscriptionInstructionDataSerializer(): Serializer<
  ClaimSubscriptionInstructionDataArgs,
  ClaimSubscriptionInstructionData
> {
  return mapSerializer<
    ClaimSubscriptionInstructionDataArgs,
    any,
    ClaimSubscriptionInstructionData
  >(
    struct<ClaimSubscriptionInstructionData>(
      [
        ["discriminator", array(u8(), { size: 8 })],
        ["listingStartsAt", i64()],
      ],
      { description: "ClaimSubscriptionInstructionData" }
    ),
    (value) => ({
      ...value,
      discriminator: [60, 100, 221, 53, 138, 20, 105, 114],
    })
  ) as Serializer<
    ClaimSubscriptionInstructionDataArgs,
    ClaimSubscriptionInstructionData
  >;
}

// Args.
export type ClaimSubscriptionInstructionArgs =
  ClaimSubscriptionInstructionDataArgs;

// Instruction.
export function claimSubscription(
  context: Pick<Context, "programs">,
  input: ClaimSubscriptionInstructionAccounts & ClaimSubscriptionInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    "dplProtocol",
    "ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art"
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    list: { index: 0, isWritable: true, value: input.list ?? null },
    platform: { index: 1, isWritable: false, value: input.platform ?? null },
    user: { index: 2, isWritable: false, value: input.user ?? null },
    buyer: { index: 3, isWritable: true, value: input.buyer ?? null },
    seller: { index: 4, isWritable: true, value: input.seller ?? null },
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
  const resolvedArgs: ClaimSubscriptionInstructionArgs = { ...input };

  // Default values.
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
  const data = getClaimSubscriptionInstructionDataSerializer().serialize(
    resolvedArgs as ClaimSubscriptionInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
