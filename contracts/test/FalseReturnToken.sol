// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FalseReturnToken is ERC20 {
    bool public failTransfers;

    constructor() ERC20("False Return Token", "fRET") {
        _mint(msg.sender, 1_000_000 ether);
    }

    function setFailTransfers(bool value) external {
        failTransfers = value;
    }

    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        if (failTransfers) {
            return false;
        }

        return super.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        if (failTransfers) {
            return false;
        }

        return super.transferFrom(from, to, amount);
    }
}
