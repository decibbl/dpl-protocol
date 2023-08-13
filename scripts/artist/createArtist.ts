import { BN } from "@coral-xyz/anchor";
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
import { uploadMetadata } from "../ipfs";
import { Network, getUrls } from "../networks";

export const createArtist = async ({ platform }: { platform: PublicKey }) => {
  try {
    const authority = await initializeKeypair(connection, "artist1");
    const workspace = new Workspace(authority);

    const artist = workspace.findArtistPda(authority.publicKey);
    console.log("Artist:", artist.toBase58());

    const mint = Keypair.generate();
    console.log("Mint:", mint.publicKey.toBase58());

    const tokenAccount = getAssociatedTokenAddressSync(
      mint.publicKey,
      authority.publicKey
    );

    const metadata = workspace.findMetadataPda(mint.publicKey);

    const masterEdition = workspace.findMasterEditionPda(mint.publicKey);

    const fetchedPlatform = await workspace.program.account.platform.fetch(
      platform
    );

    const jsonMetadata = {
      name: "Artist One",
      description: "Decibbl Music Platform's first artist.",
      symbol: "ART",
    };

    const uri = await uploadMetadata(
      connection,
      authority,
      "./assets/Artist1.png",
      "Artist.png",
      jsonMetadata
    );
    console.log("URI:", uri);

    const collectionMint = fetchedPlatform.artistMint;

    console.log("Artist Mint:", collectionMint.toBase58());

    const collectionMetadata = workspace.findMetadataPda(collectionMint);

    const collectionMasterEdition =
      workspace.findMasterEditionPda(collectionMint);

    const assetData = {
      name: jsonMetadata.name,
      symbol: jsonMetadata.symbol,
      uri,
      sellerFeeBasisPoints: 0,
      creators: [{ address: platform, share: 100, verified: false }],
      primarySaleHappened: false,
      isMutable: true,
      tokenStandard: { nonFungible: {} },
      collection: { key: fetchedPlatform.artistMint, verified: false },
      uses: null,
      collectionDetails: { v1: { size: new BN(0) } },
      ruleSet: null,
    };

    const modifyComputeUnitsInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 500000,
      });

    const createArtistInstruction = await workspace.program.methods
      .createArtist({
        name: assetData.name,
        symbol: assetData.symbol,
        uri: assetData.uri,
        sellerFeeBasisPoints: assetData.sellerFeeBasisPoints,
        creators: assetData.creators,
        primarySaleHappened: assetData.primarySaleHappened,
        isMutable: assetData.isMutable,
        tokenStandard: assetData.tokenStandard,
        collection: assetData.collection,
        uses: assetData.uses,
        collectionDetails: assetData.collectionDetails,
        ruleSet: assetData.ruleSet,
      })
      .accounts({
        artist,
        platform,
        authority: authority.publicKey,
        mint: mint.publicKey,
        tokenAccount,
        metadata,
        masterEdition,
        metadataTokenProgram: workspace.metadataProgramId,
        sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        collectionMint,
        collectionMetadata,
        collectionMasterEdition,
        collectionAuthority: fetchedPlatform.authority,
        tokenMint: fetchedPlatform.supportedTokens[0].mint,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [modifyComputeUnitsInstruction, createArtistInstruction],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([mint, authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Create Artist Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

createArtist({
  platform: new PublicKey(process.argv[2]),
});
