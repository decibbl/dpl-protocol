/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from "@metaplex-foundation/umi";
import {
  Serializer,
  array,
  mapSerializer,
  publicKey as publicKeySerializer,
  string,
  struct,
  u8,
} from "@metaplex-foundation/umi/serializers";
import {
  SubscriptionPlanDetails,
  SubscriptionPlanDetailsArgs,
  getSubscriptionPlanDetailsSerializer,
} from "../types";

export type User = Account<UserAccountData>;

export type UserAccountData = {
  discriminator: Array<number>;
  /** authority to update the account */
  authority: PublicKey;
  /** non-transferable mint account */
  mint: PublicKey;
  /** platform which user belongs to */
  platform: PublicKey;
  /** subscription details */
  subscription: SubscriptionPlanDetails;
};

export type UserAccountDataArgs = {
  /** authority to update the account */
  authority: PublicKey;
  /** non-transferable mint account */
  mint: PublicKey;
  /** platform which user belongs to */
  platform: PublicKey;
  /** subscription details */
  subscription: SubscriptionPlanDetailsArgs;
};

export function getUserAccountDataSerializer(): Serializer<
  UserAccountDataArgs,
  UserAccountData
> {
  return mapSerializer<UserAccountDataArgs, any, UserAccountData>(
    struct<UserAccountData>(
      [
        ["discriminator", array(u8(), { size: 8 })],
        ["authority", publicKeySerializer()],
        ["mint", publicKeySerializer()],
        ["platform", publicKeySerializer()],
        ["subscription", getSubscriptionPlanDetailsSerializer()],
      ],
      { description: "UserAccountData" }
    ),
    (value) => ({
      ...value,
      discriminator: [159, 117, 95, 227, 239, 151, 58, 236],
    })
  ) as Serializer<UserAccountDataArgs, UserAccountData>;
}

export function deserializeUser(rawAccount: RpcAccount): User {
  return deserializeAccount(rawAccount, getUserAccountDataSerializer());
}

export async function fetchUser(
  context: Pick<Context, "rpc">,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<User> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, "User");
  return deserializeUser(maybeAccount);
}

export async function safeFetchUser(
  context: Pick<Context, "rpc">,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<User | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeUser(maybeAccount) : null;
}

export async function fetchAllUser(
  context: Pick<Context, "rpc">,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<User[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, "User");
    return deserializeUser(maybeAccount);
  });
}

export async function safeFetchAllUser(
  context: Pick<Context, "rpc">,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<User[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeUser(maybeAccount as RpcAccount));
}

export function getUserGpaBuilder(context: Pick<Context, "rpc" | "programs">) {
  const programId = context.programs.getPublicKey(
    "dplProtocol",
    "ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art"
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      discriminator: Array<number>;
      authority: PublicKey;
      mint: PublicKey;
      platform: PublicKey;
      subscription: SubscriptionPlanDetailsArgs;
    }>({
      discriminator: [0, array(u8(), { size: 8 })],
      authority: [8, publicKeySerializer()],
      mint: [40, publicKeySerializer()],
      platform: [72, publicKeySerializer()],
      subscription: [104, getSubscriptionPlanDetailsSerializer()],
    })
    .deserializeUsing<User>((account) => deserializeUser(account))
    .whereField("discriminator", [159, 117, 95, 227, 239, 151, 58, 236]);
}

export function getUserSize(): number {
  return 162;
}

export function findUserPda(
  context: Pick<Context, "eddsa" | "programs">,
  seeds: {
    authority: PublicKey;
  }
): Pda {
  const programId = context.programs.getPublicKey(
    "dplProtocol",
    "ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art"
  );
  return context.eddsa.findPda(programId, [
    string({ size: "variable" }).serialize("user"),
    publicKeySerializer().serialize(seeds.authority),
  ]);
}

export async function fetchUserFromSeeds(
  context: Pick<Context, "eddsa" | "programs" | "rpc">,
  seeds: Parameters<typeof findUserPda>[1],
  options?: RpcGetAccountOptions
): Promise<User> {
  return fetchUser(context, findUserPda(context, seeds), options);
}

export async function safeFetchUserFromSeeds(
  context: Pick<Context, "eddsa" | "programs" | "rpc">,
  seeds: Parameters<typeof findUserPda>[1],
  options?: RpcGetAccountOptions
): Promise<User | null> {
  return safeFetchUser(context, findUserPda(context, seeds), options);
}
