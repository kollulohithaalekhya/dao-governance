// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title DAOGovernor
 * @dev OpenZeppelin 4.9.5 compatible
 */
contract DAOGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    address public offchainAttester;
    mapping(uint256 => bool) public offchainPassed;

    event OffchainVoteResultSubmitted(uint256 indexed proposalId, bool passed);

    constructor(
        IVotes token,
        TimelockController timelock,
        address attester
    )
        Governor("DAOGovernor")
        GovernorSettings(
            1,        // voting delay
            45818,    // voting period
            0         // proposal threshold
        )
        GovernorVotes(token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(timelock)
    {
        offchainAttester = attester;
    }

    modifier onlyAttester() {
        require(msg.sender == offchainAttester, "Not attester");
        _;
    }

    function submitOffchainVoteResult(uint256 proposalId, bool passed)
        external
        onlyAttester
    {
        offchainPassed[proposalId] = passed;
        emit OffchainVoteResultSubmitted(proposalId, passed);
    }

    /* ========== Timelock-required overrides ONLY ========== */

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Governor, GovernorTimelockControl)
    {
        require(offchainPassed[proposalId], "Off-chain vote not passed");
        super._execute(
            proposalId,
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

}
