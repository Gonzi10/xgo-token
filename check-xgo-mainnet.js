import { network } from "hardhat";

const XGO_ADDRESS = "0xe0bab19A74aEe06Ea1E75D9D3b8E62487642d0D6";

async function main() {
  const { ethers } = await network.connect();

  const xgo = await ethers.getContractAt("XGO", XGO_ADDRESS);
  const [wallet] = await ethers.getSigners();

  console.log("Contrato:", XGO_ADDRESS);
  console.log("Nombre:", await xgo.name());
  console.log("Símbolo:", await xgo.symbol());
  console.log("Decimales:", await xgo.decimals());
  console.log(
    "Supply:",
    ethers.formatUnits(await xgo.totalSupply(), 18)
  );
  console.log(
    "Balance wallet:",
    ethers.formatUnits(await xgo.balanceOf(wallet.address), 18)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
