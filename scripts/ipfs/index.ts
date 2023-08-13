import { keypairIdentity, createGenericFile } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import { Connection, Keypair } from "@solana/web3.js";
import mime from "mime";
import fs from "fs";
import { initializeKeypair } from "../initializeKeypair";
import { connection } from "..";

interface JsonMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: {
    trait_type: string;
    value: any;
  }[];
  properties?: {
    files: {
      uri: string;
      type: string;
      cdn?: boolean;
    }[];
    category?: string;
  };
}

const getCategory = (type: string) => {
  return type.split("/")[0];
};

export const uploadMetadata = async (
  connection: Connection,
  signer: Keypair,
  imagePath: string,
  imageFilename: string,
  metadata: JsonMetadata
) => {
  try {
    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });
    const type = mime.getType(imagePath);
    const extension = mime.getExtension(imagePath);

    const umi = createUmi(connection.rpcEndpoint)
      .use(keypairIdentity(fromWeb3JsKeypair(signer)))
      .use(nftStorageUploader({ token: process.env.NFT_STORAGE_API_KEY }));

    const buffer = Buffer.from(base64Image, "base64");

    const file = createGenericFile(buffer, `${imageFilename}.${extension}`, {
      contentType: type,
      extension,
    });

    const [imageUri] = await umi.uploader.upload([file]);

    const modifiedMetadata: JsonMetadata = {
      ...metadata,
      image: imageUri,
      properties: {
        files: [
          {
            type,
            uri: imageUri,
            cdn: true,
          },
        ],
        category: getCategory(type),
      },
    };
    console.log("JSON:", JSON.stringify(modifiedMetadata, null, 2));

    const uri = await umi.uploader.uploadJson(modifiedMetadata);
    return uri;
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  try {
    const authority = await initializeKeypair(connection, "platform1");
    const uri = await uploadMetadata(
      connection,
      authority,
      "./assets/DecibblMusic.png",
      "DecibblMusic.png",
      {
        name: "Decibbl Music",
        description: "Decibbl Music Platform.",
        symbol: "PLAT",
      }
    );
    console.log("URI:", uri);
  } catch (error) {
    console.log(error);
  }
};

// main();
