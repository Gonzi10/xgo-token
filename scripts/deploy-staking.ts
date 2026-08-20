import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const XGO_ADDRESS =
    "0xBc6B4a77790dF774Ca26c599576fF1568bF5f41a";

  const [deployer] = await ethers.getSigners();

  console.log("Desplegando XGOStaking desde:", deployer.address);
  console.log("Token XGO:", XGO_ADDRESS);

  const Staking = await ethers.getContractFactory("XGOStaking");
  const staking = await Staking.deploy(XGO_ADDRESS);

  await staking.waitForDeployment();

  console.log(
    "XGOStaking desplegado en:",
    await staking.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
