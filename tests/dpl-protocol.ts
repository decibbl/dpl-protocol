import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { DplProtocol } from "../target/types/dpl_protocol";

describe("dpl-protocol", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DplProtocol as Program<DplProtocol>;

  // all tests are in SCRIPTS folder
});
