import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { DplArtists } from "../target/types/dpl_artists";

describe("dpl-artists", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DplArtists as Program<DplArtists>;

  // all tests are in SCRIPTS folder
});
