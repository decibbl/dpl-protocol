/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { PublicKey } from '@metaplex-foundation/umi';
import {
  Serializer,
  publicKey as publicKeySerializer,
  struct,
} from '@metaplex-foundation/umi/serializers';

export type PlatformDetails = {
  /** platform PDA address */
  address: PublicKey;
  /**
   * mint account artist wishes to receive
   * royalties in, which are supported
   * by the above platform
   */
  mint: PublicKey;
};

export type PlatformDetailsArgs = PlatformDetails;

export function getPlatformDetailsSerializer(): Serializer<
  PlatformDetailsArgs,
  PlatformDetails
> {
  return struct<PlatformDetails>(
    [
      ['address', publicKeySerializer()],
      ['mint', publicKeySerializer()],
    ],
    { description: 'PlatformDetails' }
  ) as Serializer<PlatformDetailsArgs, PlatformDetails>;
}
