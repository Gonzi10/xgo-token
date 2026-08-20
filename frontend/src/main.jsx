import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserProvider,
  Contract,
  parseUnits,
  formatUnits
} from "ethers";
import "./style.css";

const XGO =
  "0xBc6B4a77790dF774Ca26c599576fF1568bF5f41a";

const TEST_A =
  "0x81999907d7e68454ba16d75A0F67A86384e1779C";

const TEST_B =
  "0x90add3c21dc4cc8E6b0A032Cf639B086a92E7786";

const AMM_TEST =
  "0xa78a73184f8a6F7055bD7368c83C8e86d05d19ad";

const AMM_XGO =
  "0xDF6748F8be0737f2ECc7D7D2437f19E563237791";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const AMM_ABI = [
  "function reserveA() view returns (uint256)",
  "function reserveB() view returns (uint256)",
  "function totalLiquidity() view returns (uint256)",
  "function liquidity(address) view returns (uint256)",
  "function getAmountOut(uint256,uint256,uint256) view returns (uint256)",
  "function addLiquidity(uint256,uint256)",
  "function removeLiquidity(uint256)",
  "function swapAForB(uint256,uint256)",
  "function swapBForA(uint256,uint256)"
];

const PAIRS = {
  XGO_TO_TEST: {
    label: "XGO → TEST B",
    tokenIn: XGO,
    tokenOut: TEST_B,
    amm: AMM_XGO,
    direction: "A_TO_B"
  },

  TEST_TO_XGO: {
    label: "TEST B → XGO",
    tokenIn: TEST_B,
    tokenOut: XGO,
    amm: AMM_XGO,
    direction: "B_TO_A"
  },

  TEST_A_TO_B: {
    label: "TEST A → TEST B",
    tokenIn: TEST_A,
    tokenOut: TEST_B,
    amm: AMM_TEST,
    direction: "A_TO_B"
  },

  TEST_B_TO_A: {
    label: "TEST B → TEST A",
    tokenIn: TEST_B,
    tokenOut: TEST_A,
    amm: AMM_TEST,
    direction: "B_TO_A"
  }
};

function App() {
  const [account, setAccount] = useState("");

  const [pair, setPair] =
    useState("XGO_TO_TEST");

  const [amount, setAmount] =
    useState("");

  const [output, setOutput] =
    useState("0");

  const [priceImpact, setPriceImpact] =
    useState("0");

  const [minimumReceived, setMinimumReceived] =
    useState("0");

  const [balanceIn, setBalanceIn] =
    useState("0");

  const [balanceOut, setBalanceOut] =
    useState("0");

  const [status, setStatus] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [reserveXGO, setReserveXGO] =
    useState("0");

  const [reserveTEST, setReserveTEST] =
    useState("0");

  const [myLiquidity, setMyLiquidity] =
    useState("0");

  const [totalLiquidity, setTotalLiquidity] =
    useState("0");

  const [liquidityXGO, setLiquidityXGO] =
    useState("");

  const [liquidityTEST, setLiquidityTEST] =
    useState("");

  const [removeAmount, setRemoveAmount] =
    useState("");

  const selected = PAIRS[pair];

  function getProvider() {
    return new BrowserProvider(window.ethereum);
  }

  function tokenName(address) {
    if (address === XGO) return "XGO";
    if (address === TEST_B) return "TEST B";
    if (address === TEST_A) return "TEST A";
    return "TOKEN";
  }

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Instala MetaMask.");
      return;
    }

    try {
      const provider = getProvider();

      const accounts = await provider.send(
        "eth_requestAccounts",
        []
      );

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error(error);

      setStatus(
        error?.shortMessage ||
        "No se pudo conectar MetaMask."
      );
    }
  }

  async function loadBalances() {
    if (!account || !window.ethereum) return;

    try {
      const provider = getProvider();

      const tokenIn = new Contract(
        selected.tokenIn,
        ERC20_ABI,
        provider
      );

      const tokenOut = new Contract(
        selected.tokenOut,
        ERC20_ABI,
        provider
      );

      const [inBalance, outBalance] =
        await Promise.all([
          tokenIn.balanceOf(account),
          tokenOut.balanceOf(account)
        ]);

      setBalanceIn(
        formatUnits(inBalance, 18)
      );

      setBalanceOut(
        formatUnits(outBalance, 18)
      );
    } catch (error) {
      console.error(
        "Error cargando balances:",
        error
      );
    }
  }

  async function loadLiquidity() {
    if (!account || !window.ethereum) return;

    try {
      const provider = getProvider();

      const amm = new Contract(
        AMM_XGO,
        AMM_ABI,
        provider
      );

      const [
        reserveA,
        reserveB,
        total,
        mine
      ] = await Promise.all([
        amm.reserveA(),
        amm.reserveB(),
        amm.totalLiquidity(),
        amm.liquidity(account)
      ]);

      setReserveXGO(
        formatUnits(reserveA, 18)
      );

      setReserveTEST(
        formatUnits(reserveB, 18)
      );

      setTotalLiquidity(
        formatUnits(total, 18)
      );

      setMyLiquidity(
        formatUnits(mine, 18)
      );
    } catch (error) {
      console.error(
        "Error cargando liquidez:",
        error
      );
    }
  }

  async function calculateOutput(value) {
    if (
      !value ||
      Number(value) <= 0 ||
      !window.ethereum
    ) {
      setOutput("0");
      setPriceImpact("0");
      setMinimumReceived("0");
      return;
    }

    try {
      const provider = getProvider();

      const amm = new Contract(
        selected.amm,
        AMM_ABI,
        provider
      );

      const reserveA =
        await amm.reserveA();

      const reserveB =
        await amm.reserveB();

      const amountIn =
        parseUnits(value, 18);

      const reserveIn =
        selected.direction === "A_TO_B"
          ? reserveA
          : reserveB;

      const reserveOut =
        selected.direction === "A_TO_B"
          ? reserveB
          : reserveA;

      if (
        reserveIn === 0n ||
        reserveOut === 0n
      ) {
        setOutput("0");
        setPriceImpact("0");
        setMinimumReceived("0");
        return;
      }

      const result =
        await amm.getAmountOut(
          amountIn,
          reserveIn,
          reserveOut
        );

      const amountInNumber =
        Number(formatUnits(amountIn, 18));

      const resultNumber =
        Number(formatUnits(result, 18));

      const reserveInNumber =
        Number(formatUnits(
          reserveIn,
          18
        ));

      const reserveOutNumber =
        Number(formatUnits(
          reserveOut,
          18
        ));

      const spotPrice =
        reserveOutNumber /
        reserveInNumber;

      const executionPrice =
        resultNumber /
        amountInNumber;

      const impact =
        spotPrice > 0
          ? (
              (spotPrice -
                executionPrice) /
              spotPrice
            ) * 100
          : 0;

      const minimum =
        resultNumber * 0.99;

      setOutput(
        resultNumber.toFixed(6)
      );

      setPriceImpact(
        Math.max(0, impact).toFixed(4)
      );

      setMinimumReceived(
        minimum.toFixed(6)
      );
    } catch (error) {
      console.error(
        "Error calculando swap:",
        error
      );

      setOutput("0");
      setPriceImpact("0");
      setMinimumReceived("0");
    }
  }

  async function swap() {
    if (!account) {
      await connectWallet();
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      setStatus(
        "Introduce una cantidad."
      );
      return;
    }

    try {
      setLoading(true);

      setStatus(
        "Preparando transacción..."
      );

      const provider = getProvider();

      const signer =
        await provider.getSigner();

      const token = new Contract(
        selected.tokenIn,
        ERC20_ABI,
        signer
      );

      const amm = new Contract(
        selected.amm,
        AMM_ABI,
        signer
      );

      const amountIn =
        parseUnits(amount, 18);

      const allowance =
        await token.allowance(
          account,
          selected.amm
        );

      if (allowance < amountIn) {
        setStatus(
          "Aprobando token..."
        );

        const approval =
          await token.approve(
            selected.amm,
            amountIn
          );

        await approval.wait();
      }

      const reserveA =
        await amm.reserveA();

      const reserveB =
        await amm.reserveB();

      let expected;

      if (
        selected.direction === "A_TO_B"
      ) {
        expected =
          await amm.getAmountOut(
            amountIn,
            reserveA,
            reserveB
          );
      } else {
        expected =
          await amm.getAmountOut(
            amountIn,
            reserveB,
            reserveA
          );
      }

      const minimum =
        (expected * 99n) / 100n;

      setStatus(
        "Enviando swap..."
      );

      let tx;

      if (
        selected.direction === "A_TO_B"
      ) {
        tx =
          await amm.swapAForB(
            amountIn,
            minimum
          );
      } else {
        tx =
          await amm.swapBForA(
            amountIn,
            minimum
          );
      }

      setStatus(
        "Esperando confirmación..."
      );

      await tx.wait();

      setStatus(
        "Swap confirmado: " +
        tx.hash
      );

      setAmount("");
      setOutput("0");
      setPriceImpact("0");
      setMinimumReceived("0");

      await loadBalances();
      await loadLiquidity();
    } catch (error) {
      console.error(error);

      setStatus(
        error?.shortMessage ||
        error?.reason ||
        "La transacción falló."
      );
    } finally {
      setLoading(false);
    }
  }

  function calculateLiquidityFromXGO(
    value
  ) {
    if (
      !value ||
      Number(value) <= 0 ||
      Number(reserveXGO) <= 0 ||
      Number(reserveTEST) <= 0
    ) {
      setLiquidityTEST("");
      return;
    }

    const xgoAmount =
      Number(value);

    const testAmount =
      (
        xgoAmount *
        Number(reserveTEST)
      ) /
      Number(reserveXGO);

    setLiquidityTEST(
      testAmount.toFixed(6)
    );
  }

  async function addLiquidity() {
    if (!account) {
      await connectWallet();
      return;
    }

    if (
      !liquidityXGO ||
      !liquidityTEST ||
      Number(liquidityXGO) <= 0 ||
      Number(liquidityTEST) <= 0
    ) {
      setStatus(
        "Introduce XGO y TEST B."
      );
      return;
    }

    try {
      setLoading(true);

      setStatus(
        "Preparando liquidez..."
      );

      const provider = getProvider();

      const signer =
        await provider.getSigner();

      const xgo = new Contract(
        XGO,
        ERC20_ABI,
        signer
      );

      const test = new Contract(
        TEST_B,
        ERC20_ABI,
        signer
      );

      const amm = new Contract(
        AMM_XGO,
        AMM_ABI,
        signer
      );

      const amountXGO =
        parseUnits(
          liquidityXGO,
          18
        );

      const amountTEST =
        parseUnits(
          liquidityTEST,
          18
        );

      let allowanceXGO =
        await xgo.allowance(
          account,
          AMM_XGO
        );

      if (
        allowanceXGO < amountXGO
      ) {
        setStatus(
          "Aprobando XGO..."
        );

        const tx1 =
          await xgo.approve(
            AMM_XGO,
            amountXGO
          );

        await tx1.wait();
      }

      let allowanceTEST =
        await test.allowance(
          account,
          AMM_XGO
        );

      if (
        allowanceTEST < amountTEST
      ) {
        setStatus(
          "Aprobando TEST B..."
        );

        const tx2 =
          await test.approve(
            AMM_XGO,
            amountTEST
          );

        await tx2.wait();
      }

      setStatus(
        "Añadiendo liquidez..."
      );

      const tx =
        await amm.addLiquidity(
          amountXGO,
          amountTEST
        );

      await tx.wait();

      setStatus(
        "Liquidez añadida: " +
        tx.hash
      );

      setLiquidityXGO("");
      setLiquidityTEST("");

      await loadBalances();
      await loadLiquidity();
    } catch (error) {
      console.error(error);

      setStatus(
        error?.shortMessage ||
        error?.reason ||
        "No se pudo añadir liquidez."
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeLiquidity() {
    if (!account) {
      await connectWallet();
      return;
    }

    if (
      !removeAmount ||
      Number(removeAmount) <= 0
    ) {
      setStatus(
        "Introduce la cantidad de liquidez."
      );
      return;
    }

    try {
      setLoading(true);

      const provider = getProvider();

      const signer =
        await provider.getSigner();

      const amm = new Contract(
        AMM_XGO,
        AMM_ABI,
        signer
      );

      const amount =
        parseUnits(
          removeAmount,
          18
        );

      setStatus(
        "Retirando liquidez..."
      );

      const tx =
        await amm.removeLiquidity(
          amount
        );

      await tx.wait();

      setStatus(
        "Liquidez retirada: " +
        tx.hash
      );

      setRemoveAmount("");

      await loadBalances();
      await loadLiquidity();
    } catch (error) {
      console.error(error);

      setStatus(
        error?.shortMessage ||
        error?.reason ||
        "No se pudo retirar la liquidez."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!account) return;

    loadBalances();
    loadLiquidity();
  }, [account, pair]);

  useEffect(() => {
    if (
      amount &&
      Number(amount) > 0 &&
      window.ethereum
    ) {
      calculateOutput(amount);
    } else {
      setOutput("0");
      setPriceImpact("0");
      setMinimumReceived("0");
    }
  }, [amount, pair]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged =
      (accounts) => {
        if (
          accounts &&
          accounts.length > 0
        ) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      };

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  const participation =
    Number(totalLiquidity) > 0
      ? (
          Number(myLiquidity) /
          Number(totalLiquidity) *
          100
        ).toFixed(4)
      : "0";

  const priceXGO =
    Number(reserveXGO) > 0
      ? (
          Number(reserveTEST) /
          Number(reserveXGO)
        ).toFixed(6)
      : "0";

  const priceTEST =
    Number(reserveTEST) > 0
      ? (
          Number(reserveXGO) /
          Number(reserveTEST)
        ).toFixed(6)
      : "0";

  const effectivePrice =
    amount &&
    Number(amount) > 0 &&
    Number(output) > 0
      ? (
          Number(output) /
          Number(amount)
        ).toFixed(6)
      : "0";

  return (
    <div className="app">
      <div className="card">

        <h1>🚀 XGO Web3</h1>

        {!account ? (
          <button
            onClick={connectWallet}
          >
            🔐 Conectar MetaMask
          </button>
        ) : (
          <p className="account">
            Cuenta:
            <br />
            {account}
          </p>
        )}

        <hr />

        <h2>🪙 Mi saldo</h2>

        <p>
          {tokenName(selected.tokenIn)}:
          <strong>
            {balanceIn}
          </strong>
        </p>

        <p>
          {tokenName(selected.tokenOut)}:
          <strong>
            {balanceOut}
          </strong>
        </p>

        <hr />

        <h2>🔄 XGO DEX</h2>

        <label>
          Par de intercambio
        </label>

        <select
          value={pair}
          onChange={(e) => {
            setPair(e.target.value);
            setAmount("");
            setOutput("0");
            setPriceImpact("0");
            setMinimumReceived("0");
          }}
        >
          <option value="XGO_TO_TEST">
            XGO → TEST B
          </option>

          <option value="TEST_TO_XGO">
            TEST B → XGO
          </option>

          <option value="TEST_A_TO_B">
            TEST A → TEST B
          </option>

          <option value="TEST_B_TO_A">
            TEST B → TEST A
          </option>
        </select>

        <input
          type="number"
          min="0"
          step="any"
          placeholder="Cantidad"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <div className="quote">

          <p>
            Recibir aproximadamente:
            <strong>
              {" "}{output}
            </strong>
          </p>

          <p>
            Precio efectivo:
            <strong>
              {" "}{effectivePrice}
            </strong>
          </p>

          <p>
            Impacto del precio:
            <strong>
              {" "}{priceImpact}%
            </strong>
          </p>

          <p>
            Mínimo recibido:
            <strong>
              {" "}{minimumReceived}
            </strong>
          </p>

        </div>

        <p>
          Slippage máximo:
          <strong>
            {" "}1%
          </strong>
        </p>

        <button
          onClick={swap}
          disabled={loading}
        >
          {loading
            ? "Procesando..."
            : "🔄 Intercambiar"}
        </button>

        <hr />

        <h2>
          💧 Liquidez XGO / TEST B
        </h2>

        <p>
          Reserva XGO:
          <strong>
            {reserveXGO}
          </strong>
        </p>

        <p>
          Reserva TEST B:
          <strong>
            {reserveTEST}
          </strong>
        </p>

        <p>
          Liquidez total:
          <strong>
            {totalLiquidity}
          </strong>
        </p>

        <p>
          Mi liquidez:
          <strong>
            {myLiquidity}
          </strong>
        </p>

        <p>
          Mi participación:
          <strong>
            {" "}{participation}%
          </strong>
        </p>

        <p>
          Precio XGO:
          <strong>
            {" "}{priceXGO} TEST B
          </strong>
        </p>

        <p>
          Precio TEST B:
          <strong>
            {" "}{priceTEST} XGO
          </strong>
        </p>

        <h3>
          ➕ Añadir liquidez
        </h3>

        <input
          type="number"
          min="0"
          step="any"
          placeholder="Cantidad XGO"
          value={liquidityXGO}
          onChange={(e) => {
            const value =
              e.target.value;

            setLiquidityXGO(value);

            calculateLiquidityFromXGO(
              value
            );
          }}
        />

        <input
          type="number"
          min="0"
          step="any"
          placeholder="Cantidad TEST B"
          value={liquidityTEST}
          onChange={(e) =>
            setLiquidityTEST(
              e.target.value
            )
          }
        />

        <button
          onClick={addLiquidity}
          disabled={loading}
        >
          💧 Añadir liquidez
        </button>

        <h3>
          ➖ Retirar liquidez
        </h3>

        <input
          type="number"
          min="0"
          step="any"
          placeholder="Cantidad de liquidez"
          value={removeAmount}
          onChange={(e) =>
            setRemoveAmount(
              e.target.value
            )
          }
        />

        <button
          onClick={removeLiquidity}
          disabled={loading}
        >
          💧 Retirar liquidez
        </button>

        {status && (
          <div className="status">
            {status}
          </div>
        )}

        <hr />

        <p>
          Pool XGO/TEST B:
          <br />
          <strong>
            {AMM_XGO}
          </strong>
        </p>

        <p>
          <a
            href={
              "https://testnet.bscscan.com/address/" +
              AMM_XGO
            }
            target="_blank"
            rel="noreferrer"
          >
            Ver pool en BscScan
          </a>
        </p>

      </div>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
