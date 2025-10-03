import { ethers } from "hardhat";

async function main() {
  console.log("Deploying OfferFactory contract...");

  // Get the contract factory
  const OfferFactory = await ethers.getContractFactory("OfferFactory");

  // Deploy the contract
  const feeRecipient = process.env.FEE_RECIPIENT || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Replace with actual fee recipient
  const usdcToken = process.env.USDC_TOKEN || "0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C"; // Replace with actual USDC address

  const offerFactory = await OfferFactory.deploy(feeRecipient, usdcToken);

  await offerFactory.waitForDeployment();

  const address = await offerFactory.getAddress();
  console.log(`OfferFactory deployed to: ${address}`);

  // Verify the contract
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [feeRecipient, usdcToken],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification failed:", error);
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "OfferFactory",
    address: address,
    feeRecipient: feeRecipient,
    usdcToken: usdcToken,
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

