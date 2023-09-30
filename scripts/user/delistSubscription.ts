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

export const delistSubscription = async ({
  domain,
  list,
}: {
  domain: string;
  list: PublicKey;
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

    const listAccount = await workspace.program.account.list.fetch(list);

    const mint = listAccount.mint;
    console.log("Mint:", mint.toBase58());

    const paymentMint = listAccount.paymentMint;

    const authorityTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      authority.publicKey
    );

    const tokenAccount = getAssociatedTokenAddressSync(mint, list, true);

    const metadata = workspace.findMetadataPda(mint);

    const masterEdition = workspace.findMasterEditionPda(mint);

    const delistSubscriptionInstruction = await workspace.program.methods
      .delistSubscription(listAccount.startTimestamp)
      .accounts({
        list,
        platform,
        user,
        authority: authority.publicKey,
        paymentMint,
        authorityTokenAccount,
        mint: mint,
        tokenAccount,
        metadata,
        masterEdition,
        metadataTokenProgram: workspace.metadataProgramId,
        sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [delistSubscriptionInstruction],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Delist Subscription Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

delistSubscription({
  domain: "music.decibbl.com",
  list: new PublicKey(process.argv[2]),
});
