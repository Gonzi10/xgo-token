import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const [wallet] = await ethers.getSigners();

  console.log("Wallet:", wallet.address);

  const balance = await ethers.provider.getBalance(wallet.address);

  console.log("Balance:", ethers.formatEther(balance), "tBNB");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
