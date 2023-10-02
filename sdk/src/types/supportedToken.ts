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
  publicKey as publicKeySerializer,
  struct,
} from "@metaplex-foundation/umi/serializers";

export type SupportedToken = {
  /** mint account of supported SPL Token */
  mint: PublicKey;
  /**
   * pool token account where
   * royalties will be distributed
   */
  tokenAccount: PublicKey;
};

export type SupportedTokenArgs = SupportedToken;

export function getSupportedTokenSerializer(): Serializer<
  SupportedTokenArgs,
  SupportedToken
> {
  return struct<SupportedToken>(
    [
      ["mint", publicKeySerializer()],
      ["tokenAccount", publicKeySerializer()],
    ],
    { description: "SupportedToken" }
  ) as Serializer<SupportedTokenArgs, SupportedToken>;
}