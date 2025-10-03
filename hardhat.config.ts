import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    domaTestnet: {
      url: process.env.DOMA_RPC_URL || "https://rpc.doma-testnet.xyz",
      chainId: parseInt(process.env.DOMA_CHAIN_ID || "1001"),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      domaTestnet: process.env.DOMA_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "domaTestnet",
        chainId: parseInt(process.env.DOMA_CHAIN_ID || "1001"),
        urls: {
          apiURL: process.env.DOMA_EXPLORER_API_URL || "https://api.doma-explorer.xyz/api",
          browserURL: process.env.DOMA_EXPLORER_URL || "https://explorer.doma-testnet.xyz",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;

