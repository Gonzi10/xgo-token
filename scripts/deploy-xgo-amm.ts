import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const XGO =
    "0xBc6B4a77790dF774Ca26c599576fF1568bF5f41a";

  const TEST_B =
    "0x90add3c21dc4cc8E6b0A032Cf639B086a92E7786";

  const AMM =
    await ethers.getContractFactory("XGOAMM");

  const amm = await AMM.deploy(
    XGO,
    TEST_B
  );

  await amm.waitForDeployment();

  console.log("XGO:", XGO);
  console.log("TEST B:", TEST_B);
  console.log(
    "XGO/TEST B AMM:",
    await amm.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
