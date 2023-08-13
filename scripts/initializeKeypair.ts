import * as web3 from "@solana/web3.js";
import * as fs from "fs";

export async function initializeKeypair(
  connection: web3.Connection,
  name: string
): Promise<web3.Keypair> {
  const keys = JSON.parse(fs.readFileSync("keys.json", "utf8"));
  if (!keys[name]) {
    console.log("Creating new keypair");
    const signer = web3.Keypair.generate();
    const newKeys = { ...keys, [name]: `[${signer.secretKey.toString()}]` };

    fs.writeFileSync("keys.json", JSON.stringify(newKeys));
    await airdropSolIfNeeded(signer, connection);
    return signer;
  }

  const _keys = JSON.parse(fs.readFileSync("keys.json", "utf8"));
  const secret = JSON.parse(_keys[name]);
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey);
  await airdropSolIfNeeded(keypairFromSecretKey, connection);
  console.log(`${name}:`, keypairFromSecretKey.publicKey.toBase58());
  return keypairFromSecretKey;
}

async function airdropSolIfNeeded(
  signer: web3.Keypair,
  connection: web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL);

  if (balance < web3.LAMPORTS_PER_SOL) {
    console.log("Airdropping 1 SOL...");
    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      web3.LAMPORTS_PER_SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    const newBalance = await connection.getBalance(signer.publicKey);
    console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL);
  }
}
