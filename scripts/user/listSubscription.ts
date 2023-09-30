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
import { Workspace, connection, network, saveLogs } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { uploadMetadata } from "../ipfs";
import { Network, getUrls } from "../networks";
import { MetadataDelegateRole } from "@metaplex-foundation/mpl-token-metadata";

export const listSubscription = async ({
  domain,
  paymentMint,
}: {
  domain: string;
  paymentMint: PublicKey;
}) => {
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

    const startTimestamp = new BN(new Date().getTime());

    const list = workspace.findListPda(authority.publicKey, startTimestamp);
    console.log("List:", list.toBase58());

    const mint = Keypair.generate();
    console.log("Mint:", mint.publicKey.toBase58());

    const authorityTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      authority.publicKey
    );

    const tokenAccount = getAssociatedTokenAddressSync(
      mint.publicKey,
      list,
      true
    );

    const metadata = workspace.findMetadataPda(mint.publicKey);

    const masterEdition = workspace.findMasterEditionPda(mint.publicKey);

    const jsonMetadata = {
      name: "User One | 29-09-2023",
      description: "First Subscription NFT of user one on Decibbl Music.",
      symbol: "SUB",
    };

    const uri = await uploadMetadata(
      connection,
      authority,
      "./assets/SubscriberNft1.png",
      "SubscriberNft.png",
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
      collectionDetails: null,
      ruleSet: null,
    };

    const modifyComputeUnitsInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 300000,
      });

    const listSubscriptionInstruction = await workspace.program.methods
      .listSubscription(startTimestamp, new BN(1), {
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
        list,
        platform,
        user,
        authority: authority.publicKey,
        paymentMint,
        authorityTokenAccount,
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
      instructions: [
        modifyComputeUnitsInstruction,
        listSubscriptionInstruction,
      ],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([mint, authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "List Subscription Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
    saveLogs(error.logs);
  }
};

listSubscription({
  domain: "music.decibbl.com",
  paymentMint: new PublicKey(process.argv[2]),
});
