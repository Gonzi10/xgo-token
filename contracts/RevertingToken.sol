// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RevertingToken is ERC20 {
    bool public blocked;

    constructor() ERC20("Reverting Test Token", "REV") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    function setBlocked(bool value) external {
        blocked = value;
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (blocked && from != address(0) && to != address(0)) {
            revert("Token transfer blocked");
        }

        super._update(from, to, value);
    }
}
