import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Keypair,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { uploadMetadata } from "../ipfs";
import { Network, getUrls } from "../networks";

export const createPlatform = async ({ domain }: { domain: string }) => {
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

    const jsonMetadata = {
      name: "Decibbl Music",
      description: "Decibbl Music Platform.",
      symbol: "PLAT",
    };

    const uri = await uploadMetadata(
      connection,
      authority,
      "./assets/DecibblMusic.png",
      "DecibblMusic.png",
      jsonMetadata
    );
    console.log("URI:", uri);

    const assetData = {
      name: jsonMetadata.name,
      symbol: jsonMetadata.symbol,
      uri,
      sellerFeeBasisPoints: 0,
      creators: [{ address: authority.publicKey, share: 100, verified: true }],
      primarySaleHappened: false,
      isMutable: true,
      tokenStandard: { nonFungible: {} },
      collection: null,
      uses: null,
      collectionDetails: { v1: { size: new BN(0) } },
      ruleSet: null,
    };

    const modifyComputeUnitsInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 350000,
      });

    const createPlatformInstruction = await workspace.program.methods
      .createPlatform(domain, {
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
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [modifyComputeUnitsInstruction, createPlatformInstruction],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([mint, authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Create Platform Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

createPlatform({
  domain: "music.decibbl.com",
});
