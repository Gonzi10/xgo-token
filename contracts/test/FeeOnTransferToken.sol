// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FeeOnTransferToken is ERC20 {
    uint256 public constant FEE_BPS = 100; // 1%

    constructor() ERC20("Fee XGO", "fXGO") {
        _mint(msg.sender, 1_000_000 ether);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (from != address(0) && to != address(0)) {
            uint256 fee = (value * FEE_BPS) / 10_000;
            uint256 amountAfterFee = value - fee;

            super._update(from, to, amountAfterFee);
            super._update(from, address(0), fee);
        } else {
            super._update(from, to, value);
        }
    }
}
