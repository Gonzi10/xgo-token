# XGO Token

XGO es un proyecto de token compatible con EVM desarrollado con Solidity y Hardhat 3.

## Estado del proyecto

Este repositorio contiene los contratos inteligentes de XGO, pruebas automatizadas, scripts de despliegue y frontend Web3.

El proyecto incluye:

- Token XGO ERC-20
- XGO AMM / DEX
- XGO Staking
- Pruebas de contratos
- Hardhat 3
- BSC Testnet
- BSC Mainnet
- Frontend Web3 con MetaMask

## Contratos inteligentes

Los contratos principales se encuentran en:

contracts/

## Frontend

El frontend Web3 se encuentra en:

frontend/

Incluye:

- Conexión con MetaMask
- Consulta de saldo XGO
- Intercambio de tokens
- Añadir liquidez
- Retirar liquidez
- Pool XGO / TEST B
- Cotización de swaps
- Impacto del precio
- Protección contra slippage

## Redes

El proyecto está configurado para:

- BSC Testnet
- BSC Mainnet
- Sepolia
- Redes locales de Hardhat

Las claves privadas, frases semilla, contraseñas y credenciales RPC nunca deben guardarse directamente en el repositorio.

## Desarrollo

Instalar dependencias:

    npm install

Compilar:

    npx hardhat compile

Ejecutar las pruebas:

    npx hardhat test

Comprobar BSC Testnet:

    npx hardhat run check-network.js --network bscTestnet

Comprobar la wallet de BSC Testnet:

    npx hardhat run check-wallet.js --network bscTestnet

Comprobar BSC Mainnet:

    npx hardhat run check-mainnet.js --network bscMainnet

## Seguridad

Antes de realizar un despliegue en Mainnet:

- Ejecutar todas las pruebas.
- Revisar los contratos inteligentes.
- Verificar las direcciones de los contratos.
- Confirmar el suministro total de XGO.
- Revisar permisos y propietarios.
- Comprobar que no existan claves privadas o secretos en Git.
- Realizar una revisión de seguridad independiente.

## Licencia

Este proyecto se encuentra actualmente en desarrollo.
