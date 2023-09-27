import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { connection, network } from "..";
import { initializeKeypair } from "../initializeKeypair";
import { uploadMetadata } from "../ipfs";
import {
  createMetadataAccountV3,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createBigInt,
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { Network, getUrls } from "../networks";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  createMint,
  mintTokensTo,
  createToken,
  createAssociatedToken,
} from "@metaplex-foundation/mpl-toolbox";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const mintToken = async () => {
  try {
    const authority = await initializeKeypair(connection, "platform1");
    const umi = createUmi(connection.rpcEndpoint).use(mplTokenMetadata());
    const authoritySigner = createSignerFromKeypair(
      umi,
      fromWeb3JsKeypair(authority)
    );
    umi.use(signerIdentity(authoritySigner));

    const jsonMetadata = {
      name: "Decibbl USDC",
      description: "Decibbl USDC.",
      symbol: "dUSDC",
    };

    // const uri = await uploadMetadata(
    //   connection,
    //   authority,
    //   "./assets/USDC.png",
    //   "USDC.png",
    //   jsonMetadata
    // );
    // console.log("URI:", uri);

    const uri =
      "https://nftstorage.link/ipfs/bafkreich5wdpcz5hkpu24ydhub2hub6toy6eyx2zk44ce2ve5v2huirpem";

    const mint = generateSigner(umi);
    const tokenAccount = getAssociatedTokenAddressSync(
      toWeb3JsPublicKey(mint.publicKey),
      authority.publicKey
    );
    console.log("Mint:", toWeb3JsPublicKey(mint.publicKey).toBase58());

    const builder = transactionBuilder()
      .add(
        createMint(umi, {
          mint,
          decimals: 8,
          mintAuthority: authoritySigner.publicKey,
          freezeAuthority: authoritySigner.publicKey,
        })
      )
      .add(
        createMetadataAccountV3(umi, {
          isMutable: false,
          data: {
            name: jsonMetadata.name,
            symbol: jsonMetadata.symbol,
            uri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          collectionDetails: null,
          mint: mint.publicKey,
          mintAuthority: authoritySigner,
        })
      )
      .add(
        createAssociatedToken(umi, {
          mint: mint.publicKey,
          ata: fromWeb3JsPublicKey(tokenAccount),
          owner: authoritySigner.publicKey,
        })
      )
      .add(
        mintTokensTo(umi, {
          amount: createBigInt(1_000_000 * 10 ** 8),
          mint: mint.publicKey,
          token: fromWeb3JsPublicKey(tokenAccount),
          mintAuthority: authoritySigner,
        })
      );
    const result = await builder.sendAndConfirm(umi, {
      confirm: { commitment: "finalized" },
    });
    const bytesSignature = result.signature;
    const signature = base58.deserialize(bytesSignature)[0];
    console.log(getUrls(Network[network], signature, "tx").explorer);
  } catch (error) {
    console.log(error);
  }
};

mintToken();
