/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { PublicKey } from "@metaplex-foundation/umi";
import {
  Serializer,
  i64,
  publicKey as publicKeySerializer,
  struct,
} from "@metaplex-foundation/umi/serializers";
import {
  SubscriptionPlan,
  SubscriptionPlanArgs,
  getSubscriptionPlanSerializer,
} from ".";

export type SubscriptionPlanDetails = {
  /** mint account of a token used to subscribe */
  mint: PublicKey;
  /** subscribed plan */
  subscribedPlan: SubscriptionPlan;
  /** start date of subscription */
  startTimestamp: bigint;
  /** end date of subscription */
  endTimestamp: bigint;
};

export type SubscriptionPlanDetailsArgs = {
  /** mint account of a token used to subscribe */
  mint: PublicKey;
  /** subscribed plan */
  subscribedPlan: SubscriptionPlanArgs;
  /** start date of subscription */
  startTimestamp: number | bigint;
  /** end date of subscription */
  endTimestamp: number | bigint;
};

export function getSubscriptionPlanDetailsSerializer(): Serializer<
  SubscriptionPlanDetailsArgs,
  SubscriptionPlanDetails
> {
  return struct<SubscriptionPlanDetails>(
    [
      ["mint", publicKeySerializer()],
      ["subscribedPlan", getSubscriptionPlanSerializer()],
      ["startTimestamp", i64()],
      ["endTimestamp", i64()],
    ],
    { description: "SubscriptionPlanDetails" }
  ) as Serializer<SubscriptionPlanDetailsArgs, SubscriptionPlanDetails>;
}
