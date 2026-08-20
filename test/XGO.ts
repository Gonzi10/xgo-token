import { expect } from "chai";
import { network } from "hardhat";

describe("XGO Token", function () {
  it("debe tener nombre XGO", async function () {
    const { ethers } = await network.connect();

    const XGO = await ethers.getContractFactory("XGO");
    const xgo = await XGO.deploy();

    expect(await xgo.name()).to.equal("XGO");
  });

  it("debe tener símbolo XGO", async function () {
    const { ethers } = await network.connect();

    const XGO = await ethers.getContractFactory("XGO");
    const xgo = await XGO.deploy();

    expect(await xgo.symbol()).to.equal("XGO");
  });

  it("debe tener exactamente 666 millones de XGO", async function () {
    const { ethers } = await network.connect();

    const XGO = await ethers.getContractFactory("XGO");
    const xgo = await XGO.deploy();

    const supply = await xgo.totalSupply();
    const expected = ethers.parseUnits("666000000", 18);

    expect(supply).to.equal(expected);
  });

  it("debe entregar todo el suministro al creador", async function () {
    const { ethers } = await network.connect();

    const [owner] = await ethers.getSigners();

    const XGO = await ethers.getContractFactory("XGO");
    const xgo = await XGO.deploy();

    expect(await xgo.balanceOf(owner.address))
      .to.equal(ethers.parseUnits("666000000", 18));
  });
});
