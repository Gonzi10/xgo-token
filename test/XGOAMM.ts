import { expect } from "chai";
import hre from "hardhat";

describe("XGOAMM", function () {
  it("crea el pool y permite añadir liquidez", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountA
    );

    await tokenB.approve(
      await amm.getAddress(),
      amountB
    );

    await amm.addLiquidity(
      amountA,
      amountB
    );

    expect(await amm.reserveA()).to.equal(amountA);
    expect(await amm.reserveB()).to.equal(amountB);
    expect(await amm.totalLiquidity()).to.be.gt(0);
  });

  it("calcula correctamente un swap", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountA
    );

    await tokenB.approve(
      await amm.getAddress(),
      amountB
    );

    await amm.addLiquidity(
      amountA,
      amountB
    );

    const amountIn = ethers.parseUnits("10", 18);

    const amountOut = await amm.getAmountOut(
      amountIn,
      amountA,
      amountB
    );

    expect(amountOut).to.be.gt(0);
    expect(amountOut).to.be.lt(amountIn);
  });

  it("permite hacer swap A por B", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountA
    );

    await tokenB.approve(
      await amm.getAddress(),
      amountB
    );

    await amm.addLiquidity(
      amountA,
      amountB
    );

    const amountIn = ethers.parseUnits("10", 18);

    const expectedOut = await amm.getAmountOut(
      amountIn,
      amountA,
      amountB
    );

    await tokenA.approve(
      await amm.getAddress(),
      amountIn
    );

    const balanceBefore =
      await tokenB.balanceOf(owner.address);

    await amm.swapAForB(
      amountIn,
      expectedOut
    );

    const balanceAfter =
      await tokenB.balanceOf(owner.address);

    expect(balanceAfter - balanceBefore)
      .to.equal(expectedOut);
  });
  it("permite hacer swap B por A", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountA
    );

    await tokenB.approve(
      await amm.getAddress(),
      amountB
    );

    await amm.addLiquidity(
      amountA,
      amountB
    );

    const amountIn = ethers.parseUnits("10", 18);

    const expectedOut = await amm.getAmountOut(
      amountIn,
      amountB,
      amountA
    );

    await tokenB.approve(
      await amm.getAddress(),
      amountIn
    );

    const balanceBefore =
      await tokenA.balanceOf(owner.address);

    await amm.swapBForA(
      amountIn,
      expectedOut
    );

    const balanceAfter =
      await tokenA.balanceOf(owner.address);

    expect(balanceAfter - balanceBefore)
      .to.equal(expectedOut);
  });
  it("rechaza un swap si no se cumple el slippage", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountA
    );

    await tokenB.approve(
      await amm.getAddress(),
      amountB
    );

    await amm.addLiquidity(
      amountA,
      amountB
    );

    const amountIn = ethers.parseUnits("10", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountIn
    );

    const impossibleMinimum =
      ethers.parseUnits("100", 18);

    await expect(
      amm.swapAForB(
        amountIn,
        impossibleMinimum
      )
    ).to.be.revertedWith("Slippage");
  });

  it("rechaza cálculos que provocarían overflow", async function () {
    const { ethers } = await hre.network.connect();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const max = ethers.MaxUint256;

    await expect(
      amm.getAmountOut(
        max,
        max,
        max
      )
    ).to.be.revert(ethers);
  });

  it("rechaza liquidez desproporcionada en un pool existente", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const initialA = ethers.parseUnits("1000", 18);
    const initialB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      initialA
    );

    await tokenB.approve(
      await amm.getAddress(),
      initialB
    );

    await amm.addLiquidity(
      initialA,
      initialB
    );

    const badA = ethers.parseUnits("1000", 18);
    const badB = ethers.parseUnits("1", 18);

    await tokenA.approve(
      await amm.getAddress(),
      badA
    );

    await tokenB.approve(
      await amm.getAddress(),
      badB
    );

    await expect(
      amm.addLiquidity(badA, badB)
    ).to.be.revert(ethers);
  });
});

describe("XGOAMM - auditoría de liquidez", function () {

  it("permite retirar liquidez parcialmente y conserva las reservas", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    const totalLiquidity = await amm.totalLiquidity();

    const removeAmount = totalLiquidity / 2n;

    const balanceABefore =
      await tokenA.balanceOf(owner.address);

    const balanceBBefore =
      await tokenB.balanceOf(owner.address);

    await amm.removeLiquidity(removeAmount);

    const balanceAAfter =
      await tokenA.balanceOf(owner.address);

    const balanceBAfter =
      await tokenB.balanceOf(owner.address);

    expect(balanceAAfter).to.be.gt(balanceABefore);
    expect(balanceBAfter).to.be.gt(balanceBBefore);

    expect(await amm.totalLiquidity())
      .to.equal(totalLiquidity - removeAmount);

    expect(await amm.reserveA())
      .to.be.lt(amountA);

    expect(await amm.reserveB())
      .to.be.lt(amountB);
  });


  it("permite retirar toda la liquidez", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    const liquidity = await amm.totalLiquidity();

    await amm.removeLiquidity(liquidity);

    expect(await amm.totalLiquidity()).to.equal(0);
    expect(await amm.reserveA()).to.equal(0);
    expect(await amm.reserveB()).to.equal(0);
  });


  it("mantiene correctamente las reservas al añadir liquidez dos veces", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const firstA = ethers.parseUnits("1000", 18);
    const firstB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), firstA);
    await tokenB.approve(await amm.getAddress(), firstB);

    await amm.addLiquidity(firstA, firstB);

    const secondA = ethers.parseUnits("500", 18);
    const secondB = ethers.parseUnits("500", 18);

    await tokenA.approve(await amm.getAddress(), secondA);
    await tokenB.approve(await amm.getAddress(), secondB);

    await amm.addLiquidity(secondA, secondB);

    expect(await amm.reserveA())
      .to.equal(firstA + secondA);

    expect(await amm.reserveB())
      .to.equal(firstB + secondB);

    expect(await amm.totalLiquidity())
      .to.be.gt(0);
  });

});

describe("XGOAMM - auditoría de reservas reales", function () {

  it("mantiene balance real igual a las reservas después de añadir liquidez", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    const ammAddress = await amm.getAddress();

    const realA = await tokenA.balanceOf(ammAddress);
    const realB = await tokenB.balanceOf(ammAddress);

    expect(realA).to.equal(await amm.reserveA());
    expect(realB).to.equal(await amm.reserveB());
  });


  it("detecta tokens enviados directamente al contrato fuera de las reservas", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    const extraA = ethers.parseUnits("100", 18);

    await tokenA.transfer(
      await amm.getAddress(),
      extraA
    );

    const realA =
      await tokenA.balanceOf(await amm.getAddress());

    const reserveA =
      await amm.reserveA();

    expect(realA).to.equal(reserveA + extraA);
  });


  it("no permite retirar más liquidez de la registrada", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    const liquidity =
      await amm.totalLiquidity();

    await expect(
      amm.removeLiquidity(liquidity + 1n)
    ).to.be.revert(ethers);
  });

});

describe("XGOAMM - auditoría de swaps y reservas", function () {

  it("mantiene las reservas sincronizadas después de un swap", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    const amountIn = ethers.parseUnits("10", 18);

    const amountOut = await amm.getAmountOut(
      amountIn,
      amountA,
      amountB
    );

    await tokenA.approve(
      await amm.getAddress(),
      amountIn
    );

    await amm.swapAForB(
      amountIn,
      amountOut
    );

    const ammAddress = await amm.getAddress();

    const realA = await tokenA.balanceOf(ammAddress);
    const realB = await tokenB.balanceOf(ammAddress);

    expect(realA).to.equal(await amm.reserveA());
    expect(realB).to.equal(await amm.reserveB());
  });


  it("los tokens enviados directamente no modifican las reservas contables", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    const reserveBefore =
      await amm.reserveA();

    const extra =
      ethers.parseUnits("500", 18);

    await tokenA.transfer(
      await amm.getAddress(),
      extra
    );

    expect(await amm.reserveA())
      .to.equal(reserveBefore);
  });


  it("rechaza un swap cuando la reserva de salida no alcanza", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    await tokenA.approve(
      await amm.getAddress(),
      ethers.parseUnits("10", 18)
    );

    await expect(
      amm.swapAForB(
        ethers.parseUnits("10", 18),
        ethers.parseUnits("1000", 18)
      )
    ).to.be.revert(ethers);
  });


  it("permite retirar liquidez correctamente después de un swap", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(await amm.getAddress(), amountA);
    await tokenB.approve(await amm.getAddress(), amountB);

    await amm.addLiquidity(amountA, amountB);

    const swapIn = ethers.parseUnits("10", 18);

    const swapOut = await amm.getAmountOut(
      swapIn,
      amountA,
      amountB
    );

    await tokenA.approve(
      await amm.getAddress(),
      swapIn
    );

    await amm.swapAForB(
      swapIn,
      swapOut
    );

    const liquidity =
      await amm.totalLiquidity();

    await amm.removeLiquidity(liquidity);

    expect(await amm.totalLiquidity())
      .to.equal(0);

    expect(await amm.reserveA())
      .to.equal(0);

    expect(await amm.reserveB())
      .to.equal(0);
  });

});

describe("XGOAMM - auditoría fee-on-transfer", function () {

  it("detecta diferencia entre tokens enviados y tokens realmente recibidos", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");
    const FeeToken = await ethers.getContractFactory("FeeToken");
    const AMM = await ethers.getContractFactory("XGOAMM");

    const normalToken = await Token.deploy();
    const feeToken = await FeeToken.deploy();

    await normalToken.waitForDeployment();
    await feeToken.waitForDeployment();

    const amm = await AMM.deploy(
      await normalToken.getAddress(),
      await feeToken.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await normalToken.approve(
      await amm.getAddress(),
      amountA
    );

    await feeToken.approve(
      await amm.getAddress(),
      amountB
    );

    const ammAddress = await amm.getAddress();

    const balanceBeforeA =
      await normalToken.balanceOf(ammAddress);

    const balanceBeforeB =
      await feeToken.balanceOf(ammAddress);

    await amm.addLiquidity(
      amountA,
      amountB
    );

    const balanceAfterA =
      await normalToken.balanceOf(ammAddress);

    const balanceAfterB =
      await feeToken.balanceOf(ammAddress);

    const receivedA =
      balanceAfterA - balanceBeforeA;

    const receivedB =
      balanceAfterB - balanceBeforeB;

    expect(receivedA).to.equal(amountA);

    expect(receivedB).to.equal(
      amountB * 99n / 100n
    );

    expect(await amm.reserveA()).to.equal(amountA);

    expect(await amm.reserveB()).to.equal(receivedB);

    expect(receivedB).to.equal(
      amountB * 99n / 100n
    );
  });

});

describe("XGOAMM - auditoría de swaps fee-on-transfer", function () {

  it("calcula el swap usando los tokens realmente recibidos A -> B", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const FeeToken = await ethers.getContractFactory("FeeToken");
    const AMM = await ethers.getContractFactory("XGOAMM");

    const normalToken = await Token.deploy();
    const feeToken = await FeeToken.deploy();

    await normalToken.waitForDeployment();
    await feeToken.waitForDeployment();

    const amm = await AMM.deploy(
      await feeToken.getAddress(),
      await normalToken.getAddress()
    );

    await amm.waitForDeployment();

    const liquidityFee = ethers.parseUnits("1000", 18);
    const liquidityNormal = ethers.parseUnits("1000", 18);

    await feeToken.approve(
      await amm.getAddress(),
      liquidityFee
    );

    await normalToken.approve(
      await amm.getAddress(),
      liquidityNormal
    );

    await amm.addLiquidity(
      liquidityFee,
      liquidityNormal
    );

    const reserveFeeBefore = await amm.reserveA();
    const reserveNormalBefore = await amm.reserveB();

    const amountRequested = ethers.parseUnits("100", 18);

    await feeToken.approve(
      await amm.getAddress(),
      amountRequested
    );

    const actualAmountIn =
      amountRequested * 99n / 100n;

    const expectedOut =
      await amm.getAmountOut(
        actualAmountIn,
        reserveFeeBefore,
        reserveNormalBefore
      );

    const balanceBefore =
      await normalToken.balanceOf(owner.address);

    await amm.swapAForB(
      amountRequested,
      expectedOut
    );

    const balanceAfter =
      await normalToken.balanceOf(owner.address);

    expect(balanceAfter - balanceBefore)
      .to.equal(expectedOut);

    expect(await amm.reserveA())
      .to.equal(reserveFeeBefore + actualAmountIn);

    expect(await amm.reserveB())
      .to.equal(reserveNormalBefore - expectedOut);
  });


  it("calcula el swap usando los tokens realmente recibidos B -> A", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const FeeToken = await ethers.getContractFactory("FeeToken");
    const AMM = await ethers.getContractFactory("XGOAMM");

    const normalToken = await Token.deploy();
    const feeToken = await FeeToken.deploy();

    await normalToken.waitForDeployment();
    await feeToken.waitForDeployment();

    const amm = await AMM.deploy(
      await normalToken.getAddress(),
      await feeToken.getAddress()
    );

    await amm.waitForDeployment();

    const liquidityNormal = ethers.parseUnits("1000", 18);
    const liquidityFee = ethers.parseUnits("1000", 18);

    await normalToken.approve(
      await amm.getAddress(),
      liquidityNormal
    );

    await feeToken.approve(
      await amm.getAddress(),
      liquidityFee
    );

    await amm.addLiquidity(
      liquidityNormal,
      liquidityFee
    );

    const reserveNormalBefore = await amm.reserveA();
    const reserveFeeBefore = await amm.reserveB();

    const amountRequested = ethers.parseUnits("100", 18);

    await feeToken.approve(
      await amm.getAddress(),
      amountRequested
    );

    const actualAmountIn =
      amountRequested * 99n / 100n;

    const expectedOut =
      await amm.getAmountOut(
        actualAmountIn,
        reserveFeeBefore,
        reserveNormalBefore
      );

    const balanceBefore =
      await normalToken.balanceOf(owner.address);

    await amm.swapBForA(
      amountRequested,
      expectedOut
    );

    const balanceAfter =
      await normalToken.balanceOf(owner.address);

    expect(balanceAfter - balanceBefore)
      .to.equal(expectedOut);

    expect(await amm.reserveB())
      .to.equal(reserveFeeBefore + actualAmountIn);

    expect(await amm.reserveA())
      .to.equal(reserveNormalBefore - expectedOut);
  });

});

describe("XGOAMM - auditoría de retiros fee-on-transfer", function () {

  it("detecta la comisión al retirar un token fee-on-transfer", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const FeeToken = await ethers.getContractFactory("FeeToken");
    const AMM = await ethers.getContractFactory("XGOAMM");

    const normalToken = await Token.deploy();
    const feeToken = await FeeToken.deploy();

    await normalToken.waitForDeployment();
    await feeToken.waitForDeployment();

    const amm = await AMM.deploy(
      await normalToken.getAddress(),
      await feeToken.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await normalToken.approve(
      await amm.getAddress(),
      amountA
    );

    await feeToken.approve(
      await amm.getAddress(),
      amountB
    );

    await amm.addLiquidity(
      amountA,
      amountB
    );

    const liquidity = await amm.liquidity(owner.address);

    const reserveABefore = await amm.reserveA();
    const reserveBBefore = await amm.reserveB();

    const balanceBefore =
      await feeToken.balanceOf(owner.address);

    await amm.removeLiquidity(liquidity);

    const balanceAfter =
      await feeToken.balanceOf(owner.address);

    const received =
      balanceAfter - balanceBefore;

    const expectedAmount =
      reserveBBefore;

    const expectedReceived =
      expectedAmount * 99n / 100n;

    expect(received).to.equal(expectedReceived);

    expect(await amm.reserveA()).to.equal(0);
    expect(await amm.reserveB()).to.equal(0);

    expect(await amm.totalLiquidity()).to.equal(0);
  });

});

describe("XGOAMM - invariantes después de retiros", function () {

  it("mantiene las reservas sincronizadas después de un retiro parcial", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");
    const AMM = await ethers.getContractFactory("XGOAMM");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA = ethers.parseUnits("1000", 18);
    const amountB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountA
    );

    await tokenB.approve(
      await amm.getAddress(),
      amountB
    );

    await amm.addLiquidity(amountA, amountB);

    const ammAddress = await amm.getAddress();

    const liquidityBefore =
      await amm.liquidity((await ethers.getSigners())[0].address);

    const removeAmount =
      liquidityBefore / 2n;

    await amm.removeLiquidity(removeAmount);

    const realA =
      await tokenA.balanceOf(ammAddress);

    const realB =
      await tokenB.balanceOf(ammAddress);

    const reserveA =
      await amm.reserveA();

    const reserveB =
      await amm.reserveB();

    expect(realA).to.equal(reserveA);
    expect(realB).to.equal(reserveB);
  });


  it("mantiene las reservas sincronizadas después de swap y retiro", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");
    const AMM = await ethers.getContractFactory("XGOAMM");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const initialA = ethers.parseUnits("1000", 18);
    const initialB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      initialA
    );

    await tokenB.approve(
      await amm.getAddress(),
      initialB
    );

    await amm.addLiquidity(
      initialA,
      initialB
    );

    const swapAmount =
      ethers.parseUnits("100", 18);

    await tokenA.approve(
      await amm.getAddress(),
      swapAmount
    );

    const amountOut =
      await amm.getAmountOut(
        swapAmount,
        await amm.reserveA(),
        await amm.reserveB()
      );

    await amm.swapAForB(
      swapAmount,
      amountOut
    );

    const owner =
      (await ethers.getSigners())[0];

    const liquidity =
      await amm.liquidity(owner.address);

    await amm.removeLiquidity(
      liquidity / 2n
    );

    const ammAddress =
      await amm.getAddress();

    const realA =
      await tokenA.balanceOf(ammAddress);

    const realB =
      await tokenB.balanceOf(ammAddress);

    expect(realA)
      .to.equal(await amm.reserveA());

    expect(realB)
      .to.equal(await amm.reserveB());
  });

});

describe("XGOAMM - invariantes de producto de reservas", function () {

  it("mantiene reservas positivas después de un swap A -> B", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amount = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amount
    );

    await tokenB.approve(
      await amm.getAddress(),
      amount
    );

    await amm.addLiquidity(amount, amount);

    const reserveABefore = await amm.reserveA();
    const reserveBBefore = await amm.reserveB();

    const kBefore =
      reserveABefore * reserveBBefore;

    const swapAmount =
      ethers.parseUnits("100", 18);

    await tokenA.approve(
      await amm.getAddress(),
      swapAmount
    );

    const amountOut =
      await amm.getAmountOut(
        swapAmount,
        reserveABefore,
        reserveBBefore
      );

    await amm.swapAForB(
      swapAmount,
      amountOut
    );

    const reserveAAfter =
      await amm.reserveA();

    const reserveBAfter =
      await amm.reserveB();

    expect(reserveAAfter).to.be.gt(0n);
    expect(reserveBAfter).to.be.gt(0n);

    const kAfter =
      reserveAAfter * reserveBAfter;

    expect(kAfter).to.be.gte(kBefore);
  });

  it("mantiene reservas positivas después de un swap B -> A", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amount = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amount
    );

    await tokenB.approve(
      await amm.getAddress(),
      amount
    );

    await amm.addLiquidity(amount, amount);

    const reserveABefore =
      await amm.reserveA();

    const reserveBBefore =
      await amm.reserveB();

    const kBefore =
      reserveABefore * reserveBBefore;

    const swapAmount =
      ethers.parseUnits("100", 18);

    await tokenB.approve(
      await amm.getAddress(),
      swapAmount
    );

    const amountOut =
      await amm.getAmountOut(
        swapAmount,
        reserveBBefore,
        reserveABefore
      );

    await amm.swapBForA(
      swapAmount,
      amountOut
    );

    const reserveAAfter =
      await amm.reserveA();

    const reserveBAfter =
      await amm.reserveB();

    expect(reserveAAfter).to.be.gt(0n);
    expect(reserveBAfter).to.be.gt(0n);

    const kAfter =
      reserveAAfter * reserveBAfter;

    expect(kAfter).to.be.gte(kBefore);
  });

});

describe("XGOAMM - auditoría de redondeos de liquidez", function () {

  it("no crea liquidez adicional por redondeo", async function () {
    const { ethers } = await hre.network.connect();

    const [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const initialA = ethers.parseUnits("1000", 18);
    const initialB = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      initialA
    );

    await tokenB.approve(
      await amm.getAddress(),
      initialB
    );

    await amm.addLiquidity(
      initialA,
      initialB
    );

    const ownerLiquidity =
      await amm.liquidity(owner.address);

    const totalBefore =
      await amm.totalLiquidity();

    expect(ownerLiquidity).to.equal(totalBefore);

    await tokenA.transfer(
      user.address,
      ethers.parseUnits("1", 18)
    );

    await tokenB.transfer(
      user.address,
      ethers.parseUnits("1", 18)
    );

    const userA =
      ethers.parseUnits("1", 18);

    const userB =
      ethers.parseUnits("1", 18);

    await tokenA.connect(user).approve(
      await amm.getAddress(),
      userA
    );

    await tokenB.connect(user).approve(
      await amm.getAddress(),
      userB
    );

    await amm.connect(user).addLiquidity(
      userA,
      userB
    );

    const userLiquidity =
      await amm.liquidity(user.address);

    const totalAfter =
      await amm.totalLiquidity();

    expect(userLiquidity).to.be.gt(0n);

    expect(totalAfter)
      .to.equal(totalBefore + userLiquidity);

    expect(
      await amm.liquidity(owner.address)
    ).to.equal(ownerLiquidity);
  });


  it("el retiro de liquidez no entrega más reservas de las disponibles", async function () {
    const { ethers } = await hre.network.connect();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amountA =
      ethers.parseUnits("1000", 18);

    const amountB =
      ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountA
    );

    await tokenB.approve(
      await amm.getAddress(),
      amountB
    );

    await amm.addLiquidity(
      amountA,
      amountB
    );

    const liquidity =
      await amm.liquidity(
        (await ethers.getSigners())[0].address
      );

    const reserveABefore =
      await amm.reserveA();

    const reserveBBefore =
      await amm.reserveB();

    await amm.removeLiquidity(liquidity);

    expect(await amm.reserveA())
      .to.equal(0n);

    expect(await amm.reserveB())
      .to.equal(0n);

    expect(
      await tokenA.balanceOf(await amm.getAddress())
    ).to.equal(0n);

    expect(
      await tokenB.balanceOf(await amm.getAddress())
    ).to.equal(0n);

    expect(reserveABefore).to.equal(amountA);
    expect(reserveBBefore).to.equal(amountB);
  });

});

describe("XGOAMM - auditoría multi-proveedor", function () {

  it("distribuye correctamente la liquidez entre dos proveedores", async function () {
    const { ethers } = await hre.network.connect();

    const [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const initial = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      initial
    );

    await tokenB.approve(
      await amm.getAddress(),
      initial
    );

    await amm.addLiquidity(initial, initial);

    const userAmount =
      ethers.parseUnits("500", 18);

    await tokenA.transfer(
      user.address,
      userAmount
    );

    await tokenB.transfer(
      user.address,
      userAmount
    );

    await tokenA.connect(user).approve(
      await amm.getAddress(),
      userAmount
    );

    await tokenB.connect(user).approve(
      await amm.getAddress(),
      userAmount
    );

    await amm.connect(user).addLiquidity(
      userAmount,
      userAmount
    );

    const ownerLiquidity =
      await amm.liquidity(owner.address);

    const userLiquidity =
      await amm.liquidity(user.address);

    expect(ownerLiquidity)
      .to.be.gt(userLiquidity);

    expect(await amm.totalLiquidity())
      .to.equal(
        ownerLiquidity + userLiquidity
      );
  });


  it("mantiene las participaciones después de un swap", async function () {
    const { ethers } = await hre.network.connect();

    const [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const liquidityAmount =
      ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      liquidityAmount
    );

    await tokenB.approve(
      await amm.getAddress(),
      liquidityAmount
    );

    await amm.addLiquidity(
      liquidityAmount,
      liquidityAmount
    );

    const userAmount =
      ethers.parseUnits("500", 18);

    await tokenA.transfer(
      user.address,
      userAmount
    );

    await tokenB.transfer(
      user.address,
      userAmount
    );

    await tokenA.connect(user).approve(
      await amm.getAddress(),
      userAmount
    );

    await tokenB.connect(user).approve(
      await amm.getAddress(),
      userAmount
    );

    await amm.connect(user).addLiquidity(
      userAmount,
      userAmount
    );

    const ownerLiquidityBefore =
      await amm.liquidity(owner.address);

    const userLiquidityBefore =
      await amm.liquidity(user.address);

    await tokenA.transfer(
      user.address,
      ethers.parseUnits("100", 18)
    );

    await tokenA.connect(user).approve(
      await amm.getAddress(),
      ethers.parseUnits("100", 18)
    );

    await amm.connect(user).swapAForB(
      ethers.parseUnits("100", 18),
      0
    );

    expect(await amm.liquidity(owner.address))
      .to.equal(ownerLiquidityBefore);

    expect(await amm.liquidity(user.address))
      .to.equal(userLiquidityBefore);

    expect(await amm.totalLiquidity())
      .to.equal(
        ownerLiquidityBefore +
        userLiquidityBefore
      );
  });

});

describe("XGOAMM - auditoría contra ataques de donación", function () {

  it("una donación directa no aumenta la participación del proveedor", async function () {
    const { ethers } = await hre.network.connect();

    const [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const initial =
      ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      initial
    );

    await tokenB.approve(
      await amm.getAddress(),
      initial
    );

    await amm.addLiquidity(
      initial,
      initial
    );

    const ownerLiquidity =
      await amm.liquidity(owner.address);

    const donation =
      ethers.parseUnits("500", 18);

    await tokenA.transfer(
      await amm.getAddress(),
      donation
    );

    await tokenB.transfer(
      await amm.getAddress(),
      donation
    );

    expect(await amm.liquidity(owner.address))
      .to.equal(ownerLiquidity);

    expect(await amm.reserveA())
      .to.equal(initial);

    expect(await amm.reserveB())
      .to.equal(initial);
  });


  it("un proveedor no puede retirar tokens donados mediante su liquidez registrada", async function () {
    const { ethers } = await hre.network.connect();

    const [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const initial =
      ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      initial
    );

    await tokenB.approve(
      await amm.getAddress(),
      initial
    );

    await amm.addLiquidity(
      initial,
      initial
    );

    const ownerLiquidity =
      await amm.liquidity(owner.address);

    const donation =
      ethers.parseUnits("500", 18);

    await tokenA.transfer(
      await amm.getAddress(),
      donation
    );

    await tokenB.transfer(
      await amm.getAddress(),
      donation
    );

    await amm.removeLiquidity(
      ownerLiquidity
    );

    expect(await amm.reserveA())
      .to.equal(0n);

    expect(await amm.reserveB())
      .to.equal(0n);

    expect(
      await tokenA.balanceOf(
        await amm.getAddress()
      )
    ).to.equal(donation);

    expect(
      await tokenB.balanceOf(
        await amm.getAddress()
      )
    ).to.equal(donation);
  });

});

describe("XGOAMM - auditoría de swaps consecutivos", function () {

  it("mantiene reservas coherentes después de múltiples swaps A -> B", async function () {
    const { ethers } = await hre.network.connect();

    const [owner, trader] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const liquidityAmount =
      ethers.parseUnits("10000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      liquidityAmount
    );

    await tokenB.approve(
      await amm.getAddress(),
      liquidityAmount
    );

    await amm.addLiquidity(
      liquidityAmount,
      liquidityAmount
    );

    const traderAmount =
      ethers.parseUnits("1000", 18);

    await tokenA.transfer(
      trader.address,
      traderAmount
    );

    await tokenA.connect(trader).approve(
      await amm.getAddress(),
      traderAmount
    );

    for (let i = 0; i < 5; i++) {
      const amountIn =
        ethers.parseUnits("100", 18);

      const reserveA =
        await amm.reserveA();

      const reserveB =
        await amm.reserveB();

      const expectedOut =
        await amm.getAmountOut(
          amountIn,
          reserveA,
          reserveB
        );

      await amm.connect(trader).swapAForB(
        amountIn,
        expectedOut
      );

      expect(await amm.reserveA())
        .to.equal(reserveA + amountIn);

      expect(await amm.reserveB())
        .to.equal(reserveB - expectedOut);

      expect(await amm.reserveA())
        .to.be.gt(0n);

      expect(await amm.reserveB())
        .to.be.gt(0n);
    }
  });


  it("mantiene reservas coherentes alternando A -> B y B -> A", async function () {
    const { ethers } = await hre.network.connect();

    const [owner, trader] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");

    const tokenA = await Token.deploy();
    const tokenB = await Token.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const liquidityAmount =
      ethers.parseUnits("10000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      liquidityAmount
    );

    await tokenB.approve(
      await amm.getAddress(),
      liquidityAmount
    );

    await amm.addLiquidity(
      liquidityAmount,
      liquidityAmount
    );

    const traderAmount =
      ethers.parseUnits("2000", 18);

    await tokenA.transfer(
      trader.address,
      traderAmount
    );

    await tokenB.transfer(
      trader.address,
      traderAmount
    );

    await tokenA.connect(trader).approve(
      await amm.getAddress(),
      traderAmount
    );

    await tokenB.connect(trader).approve(
      await amm.getAddress(),
      traderAmount
    );

    for (let i = 0; i < 5; i++) {

      const amountA =
        ethers.parseUnits("100", 18);

      const reserveA1 =
        await amm.reserveA();

      const reserveB1 =
        await amm.reserveB();

      const outB =
        await amm.getAmountOut(
          amountA,
          reserveA1,
          reserveB1
        );

      await amm.connect(trader).swapAForB(
        amountA,
        outB
      );

      expect(await amm.reserveA())
        .to.equal(reserveA1 + amountA);

      expect(await amm.reserveB())
        .to.equal(reserveB1 - outB);

      const amountB =
        ethers.parseUnits("50", 18);

      const reserveA2 =
        await amm.reserveA();

      const reserveB2 =
        await amm.reserveB();

      const outA =
        await amm.getAmountOut(
          amountB,
          reserveB2,
          reserveA2
        );

      await amm.connect(trader).swapBForA(
        amountB,
        outA
      );

      expect(await amm.reserveB())
        .to.equal(reserveB2 + amountB);

      expect(await amm.reserveA())
        .to.equal(reserveA2 - outA);

      expect(await amm.reserveA())
        .to.be.gt(0n);

      expect(await amm.reserveB())
        .to.be.gt(0n);
    }
  });

});

describe("XGOAMM - auditoría de atomicidad y reversiones", function () {

  it("revierte addLiquidity completo si falla la segunda transferencia", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const RevertingToken =
      await ethers.getContractFactory("RevertingToken");

    const tokenA = await Token.deploy();
    const tokenB = await RevertingToken.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amount = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amount
    );

    await tokenB.approve(
      await amm.getAddress(),
      amount
    );

    await tokenB.setBlocked(true);

    await expect(
      amm.addLiquidity(amount, amount)
    ).to.be.revertedWith("Token transfer blocked");

    expect(await amm.reserveA()).to.equal(0n);
    expect(await amm.reserveB()).to.equal(0n);
    expect(await amm.totalLiquidity()).to.equal(0n);

    expect(
      await tokenA.balanceOf(await amm.getAddress())
    ).to.equal(0n);

    expect(
      await tokenB.balanceOf(await amm.getAddress())
    ).to.equal(0n);
  });


  it("revierte swap completo si falla la transferencia de salida", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const RevertingToken =
      await ethers.getContractFactory("RevertingToken");

    const tokenA = await Token.deploy();
    const tokenB = await RevertingToken.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amount = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amount
    );

    await tokenB.approve(
      await amm.getAddress(),
      amount
    );

    await amm.addLiquidity(amount, amount);

    const reserveABefore = await amm.reserveA();
    const reserveBBefore = await amm.reserveB();

    const amountIn = ethers.parseUnits("10", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amountIn
    );

    await tokenB.setBlocked(true);

    await expect(
      amm.swapAForB(amountIn, 0)
    ).to.be.revertedWith("Token transfer blocked");

    expect(await amm.reserveA())
      .to.equal(reserveABefore);

    expect(await amm.reserveB())
      .to.equal(reserveBBefore);

    expect(
      await tokenA.balanceOf(await amm.getAddress())
    ).to.equal(reserveABefore);

    expect(
      await tokenB.balanceOf(await amm.getAddress())
    ).to.equal(reserveBBefore);
  });


  it("revierte removeLiquidity completo si falla una transferencia", async function () {
    const { ethers } = await hre.network.connect();

    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const RevertingToken =
      await ethers.getContractFactory("RevertingToken");

    const tokenA = await Token.deploy();
    const tokenB = await RevertingToken.deploy();

    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const AMM = await ethers.getContractFactory("XGOAMM");

    const amm = await AMM.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    await amm.waitForDeployment();

    const amount = ethers.parseUnits("1000", 18);

    await tokenA.approve(
      await amm.getAddress(),
      amount
    );

    await tokenB.approve(
      await amm.getAddress(),
      amount
    );

    await amm.addLiquidity(amount, amount);

    const liquidityBefore =
      await amm.liquidity(owner.address);

    const reserveABefore =
      await amm.reserveA();

    const reserveBBefore =
      await amm.reserveB();

    await tokenB.setBlocked(true);

    await expect(
      amm.removeLiquidity(liquidityBefore / 2n)
    ).to.be.revertedWith("Token transfer blocked");

    expect(
      await amm.liquidity(owner.address)
    ).to.equal(liquidityBefore);

    expect(
      await amm.reserveA()
    ).to.equal(reserveABefore);

    expect(
      await amm.reserveB()
    ).to.equal(reserveBBefore);

    expect(
      await amm.totalLiquidity()
    ).to.equal(liquidityBefore);
  });

});
