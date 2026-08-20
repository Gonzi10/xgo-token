import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const [user] = await ethers.getSigners();

  const tokenA = await ethers.getContractAt(
    "TestToken",
    "0x81999907d7e68454ba16d75A0F67A86384e1779C"
  );

  const tokenB = await ethers.getContractAt(
    "TestToken",
    "0x90add3c21dc4cc8E6b0A032Cf639B086a92E7786"
  );

  const amm = await ethers.getContractAt(
    "XGOAMM",
    "0xa78a73184f8a6F7055bD7368c83C8e86d05d19ad"
  );

  const amountIn = ethers.parseUnits("10", 18);

  const reserveA = await amm.reserveA();
  const reserveB = await amm.reserveB();

  const expectedOut = await amm.getAmountOut(
    amountIn,
    reserveA,
    reserveB
  );

  console.log("Usuario:", user.address);
  console.log(
    "TEST A antes:",
    ethers.formatUnits(
      await tokenA.balanceOf(user.address),
      18
    )
  );

  console.log(
    "TEST B antes:",
    ethers.formatUnits(
      await tokenB.balanceOf(user.address),
      18
    )
  );

  console.log(
    "Enviando:",
    ethers.formatUnits(amountIn, 18),
    "TEST A"
  );

  console.log(
    "Recibirá aproximadamente:",
    ethers.formatUnits(expectedOut, 18),
    "TEST B"
  );

  await (
    await tokenA.approve(
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

  console.log("✅ Swap realizado.");

  console.log(
    "TEST A después:",
    ethers.formatUnits(
      await tokenA.balanceOf(user.address),
      18
    )
  );

  console.log(
    "TEST B después:",
    ethers.formatUnits(
      await tokenB.balanceOf(user.address),
      18
    )
  );

  console.log(
    "Reserva A:",
    ethers.formatUnits(
      await amm.reserveA(),
      18
    )
  );

  console.log(
    "Reserva B:",
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
