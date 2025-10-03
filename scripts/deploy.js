const { ethers, upgrades } = require("hardhat");
const { writeFileSync } = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy DomaIntegrationHelper
  const DomaIntegrationHelper = await ethers.getContractFactory("DomaIntegrationHelper");
  const helper = await DomaIntegrationHelper.deploy();
  await helper.deployed();
  console.log("DomaIntegrationHelper deployed to:", helper.address);

  // Deploy DomaLandOfferManager
  const DomaLandOfferManager = await ethers.getContractFactory("DomaLandOfferManager");
  const offerManager = await DomaLandOfferManager.deploy(deployer.address); // Set deployer as fee recipient
  await offerManager.deployed();
  console.log("DomaLandOfferManager deployed to:", offerManager.address);

  // Configuration data for frontend
  const config = {
    network: network.name,
    chainId: network.config.chainId,
    contracts: {
      domaIntegrationHelper: helper.address,
      domaLandOfferManager: offerManager.address,
      domaMarketplace: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Doma Marketplace address
      domaRegistrar: "0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c",   // Doma Registrar address
      domaResolver: "0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3",     // Doma Resolver address
      usdcToken: "0xA0b86a33E6441b8dB2B2b0b0b0b0b0b0b0b0b0b0"        // USDC address on Doma chain
    },
    supportedTokens: {
      native: "0x0000000000000000000000000000000000000000",
      usdc: "0xA0b86a33E6441b8dB2B2b0b0b0b0b0b0b0b0b0b0" // USDC address
    }
  };

  // Write configuration to file
  writeFileSync(
    "./deployments/config.json",
    JSON.stringify(config, null, 2)
  );

  // Write contract addresses to file
  writeFileSync(
    "./deployments/addresses.json",
    JSON.stringify({
      DomaIntegrationHelper: helper.address,
      DomaLandOfferManager: offerManager.address
    }, null, 2)
  );

  // Write ABIs to files
  const helperArtifact = await artifacts.readArtifact("DomaIntegrationHelper");
  const offerManagerArtifact = await artifacts.readArtifact("DomaLandOfferManager");

  writeFileSync(
    "./deployments/abi/DomaIntegrationHelper.json",
    JSON.stringify(helperArtifact.abi, null, 2)
  );

  writeFileSync(
    "./deployments/abi/DomaLandOfferManager.json",
    JSON.stringify(offerManagerArtifact.abi, null, 2)
  );

  console.log("Configuration files written successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


