// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IXGOStakingReentry {
    function withdraw() external;
}

contract ReentrantToken is ERC20 {
    address public staking;
    bool public attackEnabled;

    constructor() ERC20("Reentrant XGO", "rXGO") {
        _mint(msg.sender, 1_000_000 ether);
    }

    function setStaking(address _staking) external {
        staking = _staking;
    }

    function enableAttack(bool enabled) external {
        attackEnabled = enabled;
    }

    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        bool result = super.transfer(to, amount);

        if (
            attackEnabled &&
            msg.sender == staking &&
            staking != address(0)
        ) {
            IXGOStakingReentry(staking).withdraw();
        }

        return result;
    }
}
