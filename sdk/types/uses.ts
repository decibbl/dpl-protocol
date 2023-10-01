/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Serializer,
  i64,
  struct,
  u64,
} from "@metaplex-foundation/umi/serializers";

export type Uses = {
  /** total number of usage till last cycle */
  total: bigint;
  /** last updated cycle - 1 cycle = 7 days */
  lastCycle: bigint;
};

export type UsesArgs = {
  /** total number of usage till last cycle */
  total: number | bigint;
  /** last updated cycle - 1 cycle = 7 days */
  lastCycle: number | bigint;
};

export function getUsesSerializer(): Serializer<UsesArgs, Uses> {
  return struct<Uses>(
    [
      ["total", u64()],
      ["lastCycle", i64()],
    ],
    { description: "Uses" }
  ) as Serializer<UsesArgs, Uses>;
}
