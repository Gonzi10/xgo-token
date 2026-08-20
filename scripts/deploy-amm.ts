import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const [deployer] = await ethers.getSigners();

  console.log("Desplegando desde:", deployer.address);

  const Token = await ethers.getContractFactory("TestToken");

  const tokenA = await Token.deploy();
  await tokenA.waitForDeployment();

  console.log(
    "TEST A:",
    await tokenA.getAddress()
  );

  const tokenB = await Token.deploy();
  await tokenB.waitForDeployment();

  console.log(
    "TEST B:",
    await tokenB.getAddress()
  );

  const AMM = await ethers.getContractFactory("XGOAMM");

  const amm = await AMM.deploy(
    await tokenA.getAddress(),
    await tokenB.getAddress()
  );

  await amm.waitForDeployment();

  console.log(
    "XGOAMM:",
    await amm.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
