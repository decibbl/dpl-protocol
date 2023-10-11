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
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { uploadMetadata } from "../ipfs";
import { BN } from "@coral-xyz/anchor";
import { Network, getUrls } from "../networks";

export const createUser = async ({ domain }: { domain: string }) => {
  try {
    const authority = await initializeKeypair(connection, "user1");
    const platformAuthority = await initializeKeypair(connection, "platform1");

    const workspace = new Workspace(authority);

    const user = workspace.findUserPda(authority.publicKey);
    const platform = workspace.findPlatformPda(
      domain,
      platformAuthority.publicKey
    );
    console.log("Platform:", platform.toBase58());

    const platformAccount = await workspace.program.account.platform.fetch(
      platform
    );

    const mint = Keypair.generate();
    console.log("Mint:", mint.publicKey.toBase58());

    const tokenAccount = getAssociatedTokenAddressSync(
      mint.publicKey,
      authority.publicKey
    );

    const metadata = workspace.findMetadataPda(mint.publicKey);

    const masterEdition = workspace.findMasterEditionPda(mint.publicKey);

    const collectionMetadata = workspace.findMetadataPda(
      platformAccount.userMint
    );
    const collectionMasterEdition = workspace.findMasterEditionPda(
      platformAccount.userMint
    );

    const jsonMetadata = {
      name: "User One",
      description: "First user of Decibbl Music.",
      symbol: "USER",
    };

    const uri = await uploadMetadata(
      connection,
      authority,
      "./assets/User1.png",
      "User1.png",
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
      collection: { key: platformAccount.userMint, verified: false },
      uses: null,
      collectionDetails: { v1: { size: new BN(0) } },
      ruleSet: null,
    };

    const modifyComputeUnitsInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 500000,
      });

    const createUserInstruction = await workspace.program.methods
      .createUser({
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
        user,
        platform,
        authority: authority.publicKey,
        mint: mint.publicKey,
        tokenAccount,
        metadata,
        masterEdition,
        collectionAuthority: platformAuthority.publicKey,
        collectionMint: platformAccount.userMint,
        collectionMetadata,
        collectionMasterEdition,
        metadataTokenProgram: workspace.metadataProgramId,
        sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [modifyComputeUnitsInstruction, createUserInstruction],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([mint, authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Create User Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

createUser({
  domain: "music.decibbl.com",
});
