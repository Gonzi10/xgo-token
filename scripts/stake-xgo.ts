import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const XGO_ADDRESS =
    "0xBc6B4a77790dF774Ca26c599576fF1568bF5f41a";

  const STAKING_ADDRESS =
    "0xA2ddFF2b1B3784B344701Df01b6475FA259EB3D3";

  const [user] = await ethers.getSigners();

  const xgo = await ethers.getContractAt("XGO", XGO_ADDRESS);
  const staking = await ethers.getContractAt(
    "XGOStaking",
    STAKING_ADDRESS
  );

  const amount = ethers.parseUnits("100", 18);

  console.log("Usuario:", user.address);
  console.log("Aprobando:", ethers.formatUnits(amount, 18), "XGO");

  const approveTx = await xgo.approve(STAKING_ADDRESS, amount);
  await approveTx.wait();

  console.log("Aprobación confirmada.");

  const stakeTx = await staking.stake(amount);
  await stakeTx.wait();

  const [stakedAmount, unlockTime] =
    await staking.getStake(user.address);

  console.log(
    "XGO bloqueado:",
    ethers.formatUnits(stakedAmount, 18)
  );

  console.log(
    "Unlock timestamp:",
    unlockTime.toString()
  );

  console.log("Staking realizado correctamente.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
