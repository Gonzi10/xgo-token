import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const networkInfo = await ethers.provider.getNetwork();
  const blockNumber = await ethers.provider.getBlockNumber();

  console.log("Chain ID:", networkInfo.chainId.toString());
  console.log("Block:", blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
