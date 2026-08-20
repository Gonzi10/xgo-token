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

  const amountA = ethers.parseUnits("100", 18);
  const amountB = ethers.parseUnits("100", 18);

  console.log("Usuario:", user.address);
  console.log("Aprobando TEST A...");

  await (
    await tokenA.approve(
      await amm.getAddress(),
      amountA
    )
  ).wait();

  console.log("Aprobando TEST B...");

  await (
    await tokenB.approve(
      await amm.getAddress(),
      amountB
    )
  ).wait();

  console.log("Añadiendo liquidez...");

  await (
    await amm.addLiquidity(
      amountA,
      amountB
    )
  ).wait();

  console.log("Liquidez añadida correctamente.");
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
