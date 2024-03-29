/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  ClusterFilter,
  Context,
  Program,
  PublicKey,
} from "@metaplex-foundation/umi";
import {
  getDplProtocolErrorFromCode,
  getDplProtocolErrorFromName,
} from "../errors";

export const DPL_PROTOCOL_PROGRAM_ID =
  "ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art" as PublicKey<"ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art">;

export function createDplProtocolProgram(): Program {
  return {
    name: "dplProtocol",
    publicKey: DPL_PROTOCOL_PROGRAM_ID,
    getErrorFromCode(code: number, cause?: Error) {
      return getDplProtocolErrorFromCode(code, this, cause);
    },
    getErrorFromName(name: string, cause?: Error) {
      return getDplProtocolErrorFromName(name, this, cause);
    },
    isOnCluster() {
      return true;
    },
  };
}

export function getDplProtocolProgram<T extends Program = Program>(
  context: Pick<Context, "programs">,
  clusterFilter?: ClusterFilter
): T {
  return context.programs.get<T>("dplProtocol", clusterFilter);
}

export function getDplProtocolProgramId(
  context: Pick<Context, "programs">,
  clusterFilter?: ClusterFilter
): PublicKey {
  return context.programs.getPublicKey(
    "dplProtocol",
    DPL_PROTOCOL_PROGRAM_ID,
    clusterFilter
  );
}
