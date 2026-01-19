// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title GOVToken
 * @notice Governance token with snapshot-based voting
 * @dev OpenZeppelin 4.9.5 compatible
 */
contract GOVToken is ERC20, ERC20Permit, ERC20Votes {

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    )
        ERC20(name_, symbol_)
        ERC20Permit(name_)
    {
        _mint(msg.sender, initialSupply);
    }

    /*//////////////////////////////////////////////////////////////
                    REQUIRED OVERRIDES (OZ 4.9)
    //////////////////////////////////////////////////////////////*/

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
