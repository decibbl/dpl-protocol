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

export const createCArtwork = async ({
  platform,
  collection,
}: {
  platform: PublicKey;
  collection: PublicKey;
}) => {
  try {
    const authority = await initializeKeypair(connection, "artist1");
    const workspace = new Workspace(authority);

    const artist = workspace.findArtistPda(authority.publicKey);
    console.log("Artist:", artist.toBase58());

    const mint = Keypair.generate();
    console.log("Mint:", mint.publicKey.toBase58());

    const artwork = workspace.findArtworkPda(
      authority.publicKey,
      mint.publicKey
    );
    console.log("Artwork:", artwork.toBase58());

    const tokenAccount = getAssociatedTokenAddressSync(
      mint.publicKey,
      authority.publicKey
    );

    const metadata = workspace.findMetadataPda(mint.publicKey);

    const masterEdition = workspace.findMasterEditionPda(mint.publicKey);

    const fetchedCollection = await workspace.program.account.collection.fetch(
      collection
    );

    const jsonMetadata = {
      name: "Artwork One",
      description:
        "Decibbl Music Platform's first artist's first collection's first artwork.",
      symbol: "ART",
    };

    const uri = await uploadMetadata(
      connection,
      authority,
      "./assets/Artwork1.png",
      "Artwork.png",
      jsonMetadata
    );
    console.log("URI:", uri);

    const collectionMint = fetchedCollection.mint;

    console.log("Collection Mint:", collectionMint.toBase58());

    const collectionMetadata = workspace.findMetadataPda(collectionMint);

    const collectionMasterEdition =
      workspace.findMasterEditionPda(collectionMint);

    const assetData = {
      name: jsonMetadata.name,
      symbol: jsonMetadata.symbol,
      uri,
      sellerFeeBasisPoints: 0,
      creators: [{ address: authority.publicKey, share: 100, verified: true }],
      primarySaleHappened: false,
      isMutable: true,
      tokenStandard: { nonFungible: {} },
      collection: { key: collectionMint, verified: false },
      uses: null,
      collectionDetails: { v1: { size: new BN(0) } },
      ruleSet: null,
    };

    const modifyComputeUnitsInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 500000,
      });

    const createCollectionInstruction = await workspace.program.methods
      .createArtwork(
        {
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
        },
        true,
        { zero: {} }
      )
      .accounts({
        artwork,
        collection,
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
    transaction.sign([mint, authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Create Artwork Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

createCArtwork({
  platform: new PublicKey(process.argv[2]),
  collection: new PublicKey(process.argv[3]),
});
