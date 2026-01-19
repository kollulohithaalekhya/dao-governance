// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Treasury
 * @notice DAO-controlled treasury
 * @dev Ownership will be transferred to Timelock
 */
contract Treasury is Ownable {

    event FundsWithdrawn(address indexed to, uint256 amount);

    receive() external payable {}

    /**
     * @notice Withdraw ETH from treasury
     * @dev Callable only via governance (Timelock)
     */
    function withdraw(address payable to, uint256 amount)
        external
        onlyOwner
    {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
        emit FundsWithdrawn(to, amount);
    }
}
