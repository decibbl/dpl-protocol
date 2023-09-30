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
import { Network, getUrls } from "../networks";

export const claimSubscription = async ({
  domain,
  list,
}: {
  domain: string;
  list: PublicKey;
}) => {
  try {
    const seller = await initializeKeypair(connection, "user1");
    const authority = await initializeKeypair(connection, "user2");
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

    const tokenAccount = getAssociatedTokenAddressSync(
      mint,
      authority.publicKey
    );

    const metadata = workspace.findMetadataPda(mint);

    const masterEdition = workspace.findMasterEditionPda(mint);

    const claimSubscriptionInstruction = await workspace.program.methods
      .claimSubscription(listAccount.startTimestamp)
      .accounts({
        list,
        platform,
        user,
        buyer: authority.publicKey,
        seller: seller.publicKey,
        mint,
        tokenAccount,
        metadata,
        masterEdition,
        metadataTokenProgram: workspace.metadataProgramId,
        sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [claimSubscriptionInstruction],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Claim Subscription Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

claimSubscription({
  domain: "music.decibbl.com",
  list: new PublicKey(process.argv[2]),
});
