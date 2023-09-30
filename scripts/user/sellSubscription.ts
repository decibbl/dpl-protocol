import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { Network, getUrls } from "../networks";

export const sellSubscription = async ({
  domain,
  list,
}: {
  domain: string;
  list: PublicKey;
}) => {
  try {
    const authority = await initializeKeypair(connection, "user1");
    const buyer = await initializeKeypair(connection, "user2");
    const platformAuthority = await initializeKeypair(connection, "platform1");

    const workspace = new Workspace(authority);

    const user = workspace.findUserPda(buyer.publicKey);
    const platform = workspace.findPlatformPda(
      domain,
      platformAuthority.publicKey
    );
    console.log("Platform:", platform.toBase58());

    const listAccount = await workspace.program.account.list.fetch(list);

    const mint = listAccount.mint;
    console.log("Mint:", mint.toBase58());

    const paymentMint = listAccount.paymentMint;

    const sellerTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      authority.publicKey
    );

    const buyerTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      buyer.publicKey
    );

    const tokenAccount = getAssociatedTokenAddressSync(mint, list, true);

    const destinationTokenAccount = getAssociatedTokenAddressSync(
      mint,
      buyer.publicKey
    );

    const metadata = workspace.findMetadataPda(mint);

    const sellSubscriptionInstruction = await workspace.program.methods
      .sellSubscription(listAccount.startTimestamp)
      .accounts({
        list,
        platform,
        user,
        buyer: buyer.publicKey,
        seller: authority.publicKey,
        paymentMint,
        buyerTokenAccount,
        sellerTokenAccount,
        mint: mint,
        tokenAccount,
        destinationTokenAccount,
        metadata,
        metadataTokenProgram: workspace.metadataProgramId,
        sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [sellSubscriptionInstruction],
      payerKey: buyer.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([buyer]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Sell Subscription Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

sellSubscription({
  domain: "music.decibbl.com",
  list: new PublicKey(process.argv[2]),
});
