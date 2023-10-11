import { BN } from "@coral-xyz/anchor";
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Workspace, connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { Network, getUrls } from "../networks";
import {
  createAssociatedToken,
  syncNative,
  transferSol,
} from "@metaplex-foundation/mpl-toolbox";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsInstruction,
} from "@metaplex-foundation/umi-web3js-adapters";
import { keypairIdentity, lamports } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

export const subscribe = async ({
  domain,
  tokenMint,
}: {
  domain: string;
  tokenMint: PublicKey;
}) => {
  try {
    const authority = await initializeKeypair(connection, "user1");
    const platformAuthority = await initializeKeypair(connection, "platform1");

    const workspace = new Workspace(authority);
    const umi = createUmi(connection.rpcEndpoint).use(
      keypairIdentity(fromWeb3JsKeypair(authority))
    );

    const user = workspace.findUserPda(authority.publicKey);
    const platform = workspace.findPlatformPda(
      domain,
      platformAuthority.publicKey
    );

    const tokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      authority.publicKey
    );

    const supportedTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      platform,
      true
    );

    const plan = {
      id: 3,
      duration: { twelve: {} },
      price: new BN(0.225 * LAMPORTS_PER_SOL),
    };

    let instructions = [];

    if (tokenMint.toBase58() === NATIVE_MINT.toBase58()) {
      console.log("Wrapper SOL");
      const initializeTokenBuilder = createAssociatedToken(umi, {
        ata: fromWeb3JsPublicKey(tokenAccount),
        mint: fromWeb3JsPublicKey(NATIVE_MINT),
        owner: umi.payer.publicKey,
      });

      instructions.push(
        ...initializeTokenBuilder
          .getInstructions()
          .map((i) => toWeb3JsInstruction(i))
      );

      const transferBuilder = transferSol(umi, {
        amount: lamports(plan.price.toNumber()),
        destination: fromWeb3JsPublicKey(tokenAccount),
        source: umi.payer,
      });
      instructions.push(
        ...transferBuilder.getInstructions().map((i) => toWeb3JsInstruction(i))
      );

      const syncBuilder = syncNative(umi, {
        account: fromWeb3JsPublicKey(tokenAccount),
      });
      instructions.push(
        ...syncBuilder.getInstructions().map((i) => toWeb3JsInstruction(i))
      );
    }

    const subscribeInstruction = await workspace.program.methods
      .subscribe(plan)
      .accounts({
        platform,
        user,
        authority: authority.publicKey,
        userTokenAccount: tokenAccount,
        supportedTokenAccount,
        supportedTokenMint: tokenMint,
      })
      .signers([])
      .instruction();

    instructions.push(subscribeInstruction);

    const messageV0 = new TransactionMessage({
      instructions: [...instructions],
      payerKey: authority.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([authority]);

    const signature = await connection.sendTransaction(transaction, {});

    console.log(
      "Subscribe Signature:",
      getUrls(Network[network], signature, "tx").explorer
    );
  } catch (error) {
    console.log(error);
  }
};

subscribe({
  domain: "music.decibbl.com",
  tokenMint: new PublicKey(process.argv[2]),
});
