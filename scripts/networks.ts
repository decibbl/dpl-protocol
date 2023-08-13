import * as web3 from "@solana/web3.js";

export enum Network {
  "https://api.devnet.solana.com" = "devnet",
  "https://api.mainnet-beta.solana.com" = "mainnetBeta",
  "http://localhost:8899" = "localhost",
}

export enum Explorer {
  "solana" = "https://explorer.solana.com",
  "amman" = "${explorer}",
  "solscan" = "https://solscan.io",
  "solana-fm" = "https://solana.fm",
}

export const getUrls = (
  network: Network,
  sig?: string,
  type?: "tx" | "address",
  explorer: Explorer = Explorer.solana
) => {
  if (network === Network["https://api.devnet.solana.com"]) {
    return {
      rpc: web3.clusterApiUrl("devnet"),
      bundlrAddress: "https://devnet.bundlr.network",
      bundlrProviderUrl: web3.clusterApiUrl("devnet"),
      explorer: `${explorer}/${type}/${sig}?cluster=devnet`,
    };
  } else if (network === Network["https://api.mainnet-beta.solana.com"]) {
    return {
      rpc: web3.clusterApiUrl("mainnet-beta"),
      bundlrAddress: "https://node1.bundlr.network",
      bundlrProviderUrl: web3.clusterApiUrl("mainnet-beta"),
      explorer: `${explorer}/${type}/${sig}`,
    };
  } else {
    return {
      rpc: "http://127.0.0.1:8899",
      bundlrAddress: "https://devnet.bundlr.network",
      bundlrProviderUrl: web3.clusterApiUrl("devnet"),
      explorer: `${explorer}/${type}/${sig}?cluster=custom`,
    };
  }
};
