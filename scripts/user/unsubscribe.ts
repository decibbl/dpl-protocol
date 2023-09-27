import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { Network, getUrls } from "../networks";

export const unsubscribe = async ({ domain }: { domain: string }) => {
  try {
    const authority = await initializeKeypair(connection, "user1");
    const platformAuthority = await initializeKeypair(connection, "platform1");

    const workspace = new Workspace(authority);

    const user = workspace.findUserPda(authority.publicKey);
    const platform = workspace.findPlatformPda(
      domain,
      platformAuthority.publicKey
    );

    const subscribeInstruction = await workspace.program.methods
      .unsubscribe()
      .accounts({
        platform,
        user,
        authority: authority.publicKey,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [subscribeInstruction],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Unsubscribe Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

unsubscribe({
  domain: "music.decibbl.com",
});
