// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XGO is ERC20 {
    uint256 public constant MAX_SUPPLY = 666_000_000 * 10 ** 18;

    constructor() ERC20("XGO", "XGO") {
        _mint(msg.sender, MAX_SUPPLY);
    }
}
