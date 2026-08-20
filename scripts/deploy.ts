import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const [deployer] = await ethers.getSigners();

  console.log("Desplegando XGO desde:", deployer.address);

  const XGO = await ethers.getContractFactory("XGO");
  const xgo = await XGO.deploy();

  await xgo.waitForDeployment();

  console.log("XGO desplegado en:", await xgo.getAddress());
  console.log("Supply:", ethers.formatUnits(await xgo.totalSupply(), 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
