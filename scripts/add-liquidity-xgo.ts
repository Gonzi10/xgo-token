import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const [user] = await ethers.getSigners();

  const XGO =
    new ethers.Contract(
      "0xBc6B4a77790dF774Ca26c599576fF1568bF5f41a",
      [
        "function approve(address,uint256) returns (bool)",
        "function balanceOf(address) view returns (uint256)"
      ],
      user
    );

  const TEST_B =
    new ethers.Contract(
      "0x90add3c21dc4cc8E6b0A032Cf639B086a92E7786",
      [
        "function approve(address,uint256) returns (bool)",
        "function balanceOf(address) view returns (uint256)"
      ],
      user
    );

  const amm =
    await ethers.getContractAt(
      "XGOAMM",
      "0xDF6748F8be0737f2ECc7D7D2437f19E563237791"
    );

  const amountXGO =
    ethers.parseUnits("100", 18);

  const amountTEST =
    ethers.parseUnits("100", 18);

  console.log("Cuenta:", user.address);

  console.log("Aprobando XGO...");

  await (
    await XGO.approve(
      await amm.getAddress(),
      amountXGO
    )
  ).wait();

  console.log("Aprobando TEST B...");

  await (
    await TEST_B.approve(
      await amm.getAddress(),
      amountTEST
    )
  ).wait();

  console.log("Añadiendo liquidez...");

  await (
    await amm.addLiquidity(
      amountXGO,
      amountTEST
    )
  ).wait();

  console.log("✅ Liquidez XGO/TEST B añadida.");

  console.log(
    "Reserva XGO:",
    ethers.formatUnits(
      await amm.reserveA(),
      18
    )
  );

  console.log(
    "Reserva TEST B:",
    ethers.formatUnits(
      await amm.reserveB(),
      18
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
