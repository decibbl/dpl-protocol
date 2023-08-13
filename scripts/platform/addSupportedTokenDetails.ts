import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { Network, getUrls } from "../networks";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const addSupportedTokenDetails = async ({
  domain,
}: {
  domain: string;
}) => {
  try {
    const authority = await initializeKeypair(connection, "platform1");
    const workspace = new Workspace(authority);

    const platform = workspace.findPlatformPda(domain, authority.publicKey);
    console.log("Platform:", platform.toBase58());

    // const tokenMint = new PublicKey(
    //   "So11111111111111111111111111111111111111112"
    // );

    const tokenMint = new PublicKey(
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    );

    const tokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      authority.publicKey
    );

    console.log("Token Account:", tokenAccount.toBase58());

    const addSupportedTokenDetailsInstruction = await workspace.program.methods
      .addSupportedTokenDetails()
      .accounts({
        platform,
        authority: authority.publicKey,
        tokenMint,
        tokenAccount,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [addSupportedTokenDetailsInstruction],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Add Supported Token Details Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

addSupportedTokenDetails({ domain: "music.decibbl.com" });
