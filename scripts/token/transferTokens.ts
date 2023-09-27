import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  TransactionBuilder,
  createBigInt,
  createSignerFromKeypair,
  signerIdentity,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  createAssociatedToken,
  transferTokensChecked,
} from "@metaplex-foundation/mpl-toolbox";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getMint } from "@solana/spl-token";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { Network, getUrls } from "../networks";

const transferTokens = async ({
  mint,
  receiver,
  amount,
}: {
  mint: PublicKey;
  receiver: PublicKey;
  amount: number;
}) => {
  try {
    const authority = await initializeKeypair(connection, "platform1");
    const umi = createUmi(connection.rpcEndpoint).use(mplTokenMetadata());
    const authoritySigner = createSignerFromKeypair(
      umi,
      fromWeb3JsKeypair(authority)
    );
    umi.use(signerIdentity(authoritySigner));

    const mintAccount = await getMint(connection, mint);

    const receiverTokenAccountAddress = getAssociatedTokenAddressSync(
      mint,
      receiver
    );

    const sendTokenAccountAddress = getAssociatedTokenAddressSync(
      mint,
      authority.publicKey
    );
    console.log("Token:", receiverTokenAccountAddress.toBase58());

    const receiverTokenAccount = await connection.getAccountInfo(
      receiverTokenAccountAddress
    );

    let createAssociatedTokenAccountBuilder: TransactionBuilder;
    if (!receiverTokenAccount) {
      createAssociatedTokenAccountBuilder = createAssociatedToken(umi, {
        mint: fromWeb3JsPublicKey(mint),
        ata: fromWeb3JsPublicKey(receiverTokenAccountAddress),
        owner: fromWeb3JsPublicKey(receiver),
      });
    }

    const transferBuilder = transactionBuilder().add(
      transferTokensChecked(umi, {
        amount: createBigInt(amount * 10 ** mintAccount.decimals),
        decimals: mintAccount.decimals,
        mint: fromWeb3JsPublicKey(mint),
        source: fromWeb3JsPublicKey(sendTokenAccountAddress),
        destination: fromWeb3JsPublicKey(receiverTokenAccountAddress),
        authority: authoritySigner,
      })
    );

    let instructions = [];
    if (!receiverTokenAccount) {
      instructions.push(
        ...createAssociatedTokenAccountBuilder.getInstructions()
      );
    }
    instructions.push(...transferBuilder.getInstructions());

    const transaction = umi.transactions.create({
      blockhash: (await umi.rpc.getLatestBlockhash()).blockhash,
      instructions,
      payer: authoritySigner.publicKey,
    });

    const singedTransaction = await umi.payer.signTransaction(transaction);

    const bytesSignature = await umi.rpc.sendTransaction(singedTransaction, {
      commitment: "finalized",
    });
    const signature = base58.deserialize(bytesSignature)[0];
    console.log(getUrls(Network[network], signature, "tx").explorer);
  } catch (error) {
    console.log(error);
  }
};

transferTokens({
  mint: new PublicKey(process.argv[2]),
  receiver: new PublicKey(process.argv[3]),
  amount: parseInt(process.argv[4]),
});
