import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { Network, getUrls } from "../networks";
import { BN } from "@coral-xyz/anchor";

export const addSubscriptionPlan = async ({ domain }: { domain: string }) => {
  try {
    const authority = await initializeKeypair(connection, "platform1");
    const workspace = new Workspace(authority);

    const platform = workspace.findPlatformPda(domain, authority.publicKey);
    console.log("Platform:", platform.toBase58());

    const addSubscriptionPlanInstruction = await workspace.program.methods
      .addSubscriptionPlan({ id: 1, duration: { four: {} }, price: new BN(1) })
      .accounts({
        platform,
        authority: authority.publicKey,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [addSubscriptionPlanInstruction],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Add Subscription Plan Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

addSubscriptionPlan({ domain: "music.decibbl.com" });
