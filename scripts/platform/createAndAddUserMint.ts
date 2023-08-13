import {
  ComputeBudgetProgram,
  Keypair,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Network, getUrls } from "../networks";
import {
  AssetData,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { uploadMetadata } from "../ipfs";

export const createAndAddUserMint = async ({ domain }: { domain: string }) => {
  try {
    const authority = await initializeKeypair(connection, "platform1");
    const workspace = new Workspace(authority);

    const platform = workspace.findPlatformPda(domain, authority.publicKey);
    console.log("Platform:", platform.toBase58());

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
      name: "Decibbl Music | User Mint",
      description: "User Mint for Decibbl Music Platform.",
      symbol: "ART",
    };

    const uri = await uploadMetadata(
      connection,
      authority,
      "./assets/UserMint.png",
      "UserMint.png",
      jsonMetadata
    );
    console.log("URI:", uri);

    const collectionMint = fetchedPlatform.mint;

    const collectionMetadata = workspace.findMetadataPda(collectionMint);

    const collectionMasterEdition =
      workspace.findMasterEditionPda(collectionMint);

    const assetData = {
      name: jsonMetadata.name,
      symbol: jsonMetadata.symbol,
      uri,
      sellerFeeBasisPoints: 0,
      creators: [{ address: platform, share: 100, verified: true }],
      primarySaleHappened: false,
      isMutable: true,
      tokenStandard: { nonFungible: {} },
      collection: { key: fetchedPlatform.mint, verified: false },
      uses: null,
      collectionDetails: null,
      ruleSet: null,
    };

    const modifyComputeUnitsInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 500000,
      });

    const createAndAddUserMintInstruction = await workspace.program.methods
      .createAndAddUserMint({
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
        createAndAddUserMintInstruction,
      ],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([mint, authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Create User Mint Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

createAndAddUserMint({
  domain: "music.decibbl.com",
});
