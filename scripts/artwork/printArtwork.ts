import { BN } from "@coral-xyz/anchor";
import { MasterEditionV2 } from "@metaplex-foundation/mpl-token-metadata";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { Network, getUrls } from "../networks";

export const printArtwork = async ({
  platform,
  artwork,
}: {
  platform: PublicKey;
  artwork: PublicKey;
}) => {
  try {
    const authority = await initializeKeypair(connection, "artist1");
    const workspace = new Workspace(authority);

    const artist = workspace.findArtistPda(authority.publicKey);
    console.log("Artist:", artist.toBase58());
    console.log("Artwork:", artwork.toBase58());

    const fetchedArtwork = await workspace.program.account.artwork.fetch(
      artwork
    );

    const masterMint = fetchedArtwork.mint;
    console.log("Master Mint:", masterMint.toBase58());

    const masterTokenAccount = getAssociatedTokenAddressSync(
      masterMint,
      authority.publicKey
    );

    const masterMetadata = workspace.findMetadataPda(masterMint);

    const masterEdition = workspace.findMasterEditionPda(masterMint);

    const masterEditionAccount = MasterEditionV2.deserialize(
      (await connection.getAccountInfo(masterEdition)).data
    )[0];

    const editionMint = Keypair.generate();
    console.log("Edition Mint:", editionMint.publicKey.toBase58());

    const editionTokenAccount = getAssociatedTokenAddressSync(
      editionMint.publicKey,
      authority.publicKey
    );

    console.log("masterEditionAccount:", masterEditionAccount);

    const editionMetadata = workspace.findMetadataPda(editionMint.publicKey);

    const edition = workspace.findEditionPda(editionMint.publicKey);

    const editionMarkerPda = workspace.findEditionMarkerPda(
      masterMint,
      new BN(parseInt(masterEditionAccount.supply.toString()) + 1)
    );

    const modifyComputeUnitsInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 500000,
      });

    const printArgs = {
      v1: {
        edition: new BN(parseInt(masterEditionAccount.supply.toString()) + 1),
      },
    };
    console.log("printArgs:", printArgs);

    const createCollectionInstruction = await workspace.program.methods
      .printArtwork(printArgs)
      .accounts({
        artwork,
        collection: null,
        artist,
        platform,
        authority: authority.publicKey,
        masterMint,
        masterTokenAccount,
        masterMetadata,
        masterEdition,
        editionMetadata,
        edition,
        editionMint: editionMint.publicKey,
        editionTokenAccount,
        editionMarkerPda,
        owner: authority.publicKey,
        metadataTokenProgram: workspace.metadataProgramId,
        sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [
        modifyComputeUnitsInstruction,
        createCollectionInstruction,
      ],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([authority, editionMint]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Create Print Artwork Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

printArtwork({
  platform: new PublicKey(process.argv[2]),
  artwork: new PublicKey(process.argv[3]),
});
