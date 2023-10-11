import {
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { Network, getUrls } from "../networks";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { BN } from "bn.js";

export const distributeFunds = async ({
  domain,
  tokenMint,
}: {
  domain: string;
  tokenMint: PublicKey;
}) => {
  try {
    const platformAuthority = await initializeKeypair(connection, "platform1");
    const authority = await initializeKeypair(connection, "artist1");
    const workspace = new Workspace(authority);

    const platform = workspace.findPlatformPda(
      domain,
      platformAuthority.publicKey
    );
    console.log("Platform:", platform.toBase58());

    const artist = workspace.findArtistPda(authority.publicKey);
    console.log("Artist:", artist.toBase58());

    const tokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      platform,
      true
    );

    const artistTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      authority.publicKey
    );

    console.log("Token Account:", tokenAccount.toBase58());

    const distributeFundsInstruction = await workspace.program.methods
      .distributeFunds(new BN(0.001 * LAMPORTS_PER_SOL))
      .accounts({
        platform,
        artist,
        authority: authority.publicKey,
        platformAuthority: platformAuthority.publicKey,
        tokenMint,
        tokenAccount,
        artistTokenAccount,
      })
      .signers([])
      .instruction();

    const messageV0 = new TransactionMessage({
      instructions: [distributeFundsInstruction],
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

distributeFunds({
  domain: "music.decibbl.com",
  tokenMint: new PublicKey(process.argv[2]),
});
