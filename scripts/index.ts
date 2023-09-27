import idl from "../target/idl/dpl_protocol.json";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Network, getUrls } from "./networks";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { DplProtocol, IDL } from "../target/types/dpl_protocol";
import * as dotenv from "dotenv";

dotenv.config();

// export const network = process.env.ANCHOR_PROVIDER_URL;
export const network = AnchorProvider.env().connection.rpcEndpoint;

// @ts-ignore
export const DBL_PROTOCOL_PROGRAM_ADDRESS = idl.metadata.address
  ? // @ts-ignore
    new PublicKey(idl?.metadata.address)
  : new PublicKey("ywpMZZNG3Nx1Bu2deJCcNxzUUoWSm6YwN9r9jCF8art");

export class Wallet {
  publicKey: PublicKey;
  constructor(keypair: Keypair) {
    this.publicKey = keypair.publicKey;
  }
  signTransaction = <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise.resolve(transaction);
  signAllTransactions = <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) => Promise.resolve(transactions);
}

export const bundlrConnection = new Connection(
  getUrls(Network[network]).bundlrProviderUrl
);

export const connection = new Connection(getUrls(Network[network]).rpc);

export class Workspace {
  provider: AnchorProvider;
  programId: PublicKey;
  program: Program<DplProtocol>;
  connection: Connection;
  PLATFORM_PREFIX = "platform";
  ARTIST_PREFIX = "artist";
  USER_PREFIX = "user";
  COLLECTION_PREFIX = "collection";
  ARTWORK_PREFIX = "artwork";

  metadataProgramId = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  constructor(keypair: Keypair) {
    this.provider = new AnchorProvider(connection, new Wallet(keypair), {});
    // @ts-ignore
    this.programId = new PublicKey(idl.metadata.address);
    this.program = new Program<DplProtocol>(IDL, this.programId, this.provider);
    this.connection = this.provider.connection;
  }

  /** Finds the Platform PDA for given domain & authority address. */
  findPlatformPda = (domain: string, authority: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from(this.PLATFORM_PREFIX),
        Buffer.from(domain),
        authority.toBuffer(),
      ],
      this.programId
    )[0];

  /** Finds the Artist PDA for given authority address. */
  findArtistPda = (authority: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from(this.ARTIST_PREFIX), authority.toBuffer()],
      this.programId
    )[0];

  /** Finds the User PDA for given authority address. */
  findUserPda = (authority: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from(this.USER_PREFIX), authority.toBuffer()],
      this.programId
    )[0];

  /** Finds the Collection PDA for given authority address & mint address. */
  findCollectionPda = (authority: PublicKey, mint: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from(this.COLLECTION_PREFIX),
        authority.toBuffer(),
        mint.toBuffer(),
      ],
      this.programId
    )[0];

  /** Finds the Artwork PDA for given authority address & mint address. */
  findArtworkPda = (authority: PublicKey, mint: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from(this.ARTWORK_PREFIX), authority.toBuffer(), mint.toBuffer()],
      this.programId
    )[0];

  /** Finds the Metadata PDA for given mint address. */
  findMetadataPda = (mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata", "utf8"),
        this.metadataProgramId.toBuffer(),
        mint.toBuffer(),
      ],
      this.metadataProgramId
    )[0];
  };

  /** Finds the Master Edition PDA for given mint address. */
  findMasterEditionPda = (mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata", "utf8"),
        this.metadataProgramId.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition", "utf8"),
      ],
      this.metadataProgramId
    )[0];
  };

  /** Finds the Edition PDA for given mint address. */
  findEditionPda = (mint: PublicKey) => {
    return this.findMasterEditionPda(mint);
  };

  /** Finds the Edition Marker PDA for given mint address & edition number. */
  findEditionMarkerPda = (mint: PublicKey, edition: BN) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata", "utf8"),
        this.metadataProgramId.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition", "utf8"),
        Buffer.from(edition.div(new BN(248)).toString()),
      ],
      this.metadataProgramId
    )[0];
  };
}

export const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));
