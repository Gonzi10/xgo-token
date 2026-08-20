// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IXGOStaking {
    function stake(uint256 amount) external;
}

contract ReentrantStakeToken {
    string public name = "Reentrant Token";
    string public symbol = "rXGO";
    uint8 public decimals = 18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public staking;
    bool public attackEnabled;
    bool public attempted;

    constructor() {
        balanceOf[msg.sender] = 1_000_000 ether;
    }

    function setStaking(address _staking) external {
        staking = _staking;
    }

    function approve(address spender, uint256 amount)
        external
        returns (bool)
    {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(
            allowance[from][msg.sender] >= amount,
            "Allowance too low"
        );

        allowance[from][msg.sender] -= amount;

        require(
            balanceOf[from] >= amount,
            "Balance too low"
        );

        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        if (attackEnabled && !attempted) {
            attempted = true;

            try IXGOStaking(staking).stake(1 ether) {
                // No debería llegar aquí
            } catch {}
        }

        return true;
    }

    function setAttackEnabled(bool enabled) external {
        attackEnabled = enabled;
    }
}
