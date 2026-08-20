import hre from "hardhat";

const XGO_ADDRESS =
  "0xBc6B4a77790dF774Ca26c599576fF1568bF5f41a";

const XGO_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function main() {
  const { ethers } = await hre.network.connect();

  const [user] = await ethers.getSigners();

  const xgo = new ethers.Contract(
    XGO_ADDRESS,
    XGO_ABI,
    user
  );

  const balance = await xgo.balanceOf(
    user.address
  );

  const decimals = await xgo.decimals();
  const symbol = await xgo.symbol();

  console.log("Cuenta:", user.address);
  console.log(
    `${symbol} disponible:`,
    ethers.formatUnits(balance, decimals)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
