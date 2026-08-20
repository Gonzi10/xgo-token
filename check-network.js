import { network } from "hardhat";

const { provider } = await network.connect();

const chainId = await provider.send("eth_chainId");
const blockNumber = await provider.send("eth_blockNumber");

console.log("Chain ID:", BigInt(chainId).toString());
console.log("Block:", BigInt(blockNumber).toString());
