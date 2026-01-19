// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title DAOTimelock
 * @author Alekhya
 * @notice Timelock enforcing execution delay for DAO proposals
 */
contract DAOTimelock is TimelockController {

    /**
     * @param minDelay Minimum delay before execution (in seconds)
     * @param proposers Addresses allowed to schedule proposals
     * @param executors Addresses allowed to execute proposals
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
    )
        TimelockController(minDelay, proposers, executors, msg.sender)
    {}
}
