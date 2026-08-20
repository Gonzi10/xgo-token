import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const [user] = await ethers.getSigners();

  const XGO = new ethers.Contract(
    "0xBc6B4a77790dF774Ca26c599576fF1568bF5f41a",
    [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address,uint256) returns (bool)"
    ],
    user
  );

  const TEST_B = new ethers.Contract(
    "0x90add3c21dc4cc8E6b0A032Cf639B086a92E7786",
    [
      "function balanceOf(address) view returns (uint256)"
    ],
    user
  );

  const amm = await ethers.getContractAt(
    "XGOAMM",
    "0xDF6748F8be0737f2ECc7D7D2437f19E563237791"
  );

  const amountIn = ethers.parseUnits("10", 18);

  const reserveXGO = await amm.reserveA();
  const reserveTEST = await amm.reserveB();

  const expectedOut = await amm.getAmountOut(
    amountIn,
    reserveXGO,
    reserveTEST
  );

  console.log("Cuenta:", user.address);

  console.log(
    "XGO antes:",
    ethers.formatUnits(
      await XGO.balanceOf(user.address),
      18
    )
  );

  console.log(
    "TEST B antes:",
    ethers.formatUnits(
      await TEST_B.balanceOf(user.address),
      18
    )
  );

  console.log(
    "Enviando:",
    ethers.formatUnits(amountIn, 18),
    "XGO"
  );

  console.log(
    "Recibirá aproximadamente:",
    ethers.formatUnits(expectedOut, 18),
    "TEST B"
  );

  await (
    await XGO.approve(
      await amm.getAddress(),
      amountIn
    )
  ).wait();

  await (
    await amm.swapAForB(
      amountIn,
      expectedOut
    )
  ).wait();

  console.log("✅ XGO → TEST B realizado.");

  console.log(
    "XGO después:",
    ethers.formatUnits(
      await XGO.balanceOf(user.address),
      18
    )
  );

  console.log(
    "TEST B después:",
    ethers.formatUnits(
      await TEST_B.balanceOf(user.address),
      18
    )
  );

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
