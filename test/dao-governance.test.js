const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAO Governance Flow", function () {
  let token, timelock, governor, treasury;
  let deployer, voter1, voter2;

  beforeEach(async function () {
    [deployer, voter1, voter2] = await ethers.getSigners();

    /* ---------------- Deploy GOVToken ---------------- */
    const GOVToken = await ethers.getContractFactory(
      "contracts/GOVToken.sol:GOVToken"
    );

    token = await GOVToken.deploy(
      "DAO Governance Token",
      "GOV",
      ethers.parseEther("1000000")
    );
    await token.waitForDeployment();

    /* ---------------- Delegate voting power ---------------- */
    await token.delegate(deployer.address);

    /* ---------------- Deploy Timelock ---------------- */
    const Timelock = await ethers.getContractFactory(
      "contracts/DAOTimelock.sol:DAOTimelock"
    );

    timelock = await Timelock.deploy(1, [], []);
    await timelock.waitForDeployment();

    /* ---------------- Deploy Governor ---------------- */
    const Governor = await ethers.getContractFactory(
      "contracts/DAOGovernor.sol:DAOGovernor"
    );

    governor = await Governor.deploy(
      await token.getAddress(),
      await timelock.getAddress(),
      deployer.address // off-chain attester
    );
    await governor.waitForDeployment();

    /* ---------------- Deploy Treasury ---------------- */
    const Treasury = await ethers.getContractFactory(
      "contracts/Treasury.sol:Treasury"
    );

    treasury = await Treasury.deploy();
    await treasury.waitForDeployment();

    /* ---------------- Configure Timelock roles ---------------- */
    await timelock.grantRole(
      await timelock.PROPOSER_ROLE(),
      await governor.getAddress()
    );

    await timelock.grantRole(
      await timelock.EXECUTOR_ROLE(),
      await governor.getAddress()
    );

    await timelock.grantRole(
      await timelock.EXECUTOR_ROLE(),
      ethers.ZeroAddress
    );

    await timelock.revokeRole(
      await timelock.TIMELOCK_ADMIN_ROLE(),
      deployer.address
    );

    /* ---------------- Transfer Treasury ownership ---------------- */
    await treasury.transferOwnership(await timelock.getAddress());

    /* ---------------- Fund Treasury ---------------- */
    await deployer.sendTransaction({
      to: await treasury.getAddress(),
      value: ethers.parseEther("5"),
    });
  });

  it("should create, vote, queue, and execute a treasury withdrawal proposal", async function () {
    const withdrawAmount = ethers.parseEther("1");

    /* ---------------- Encode treasury call ---------------- */
    const encodedCall = treasury.interface.encodeFunctionData(
      "withdraw",
      [deployer.address, withdrawAmount]
    );

    /* ---------------- Create proposal ---------------- */
    const proposeTx = await governor.propose(
      [await treasury.getAddress()],
      [0],
      [encodedCall],
      "Withdraw 1 ETH from treasury"
    );

    const proposeReceipt = await proposeTx.wait();
    const proposalId = proposeReceipt.logs[0].args.proposalId;

    /* ---------------- Move to voting state ---------------- */
    await ethers.provider.send("evm_mine");
    await ethers.provider.send("evm_mine");

    /* ---------------- Vote FOR proposal ---------------- */
    await governor.castVote(proposalId, 1); // 1 = For

    /* ---------------- Advance blocks past voting period ---------------- */
    for (let i = 0; i < 46000; i++) {
      await ethers.provider.send("evm_mine");
    }

    /* ---------------- Off-chain attestation ---------------- */
    await governor.submitOffchainVoteResult(proposalId, true);

    /* ---------------- Queue proposal ---------------- */
    const descriptionHash = ethers.keccak256(
      ethers.toUtf8Bytes("Withdraw 1 ETH from treasury")
    );

    await governor.queue(
      [await treasury.getAddress()],
      [0],
      [encodedCall],
      descriptionHash
    );

    /* ---------------- Increase time for timelock ---------------- */
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    /* ---------------- Treasury balance BEFORE ---------------- */
    const treasuryBalanceBefore = await ethers.provider.getBalance(
      await treasury.getAddress()
    );

    /* ---------------- Execute proposal ---------------- */
    await governor.execute(
      [await treasury.getAddress()],
      [0],
      [encodedCall],
      descriptionHash
    );

    /* ---------------- Treasury balance AFTER ---------------- */
    const treasuryBalanceAfter = await ethers.provider.getBalance(
      await treasury.getAddress()
    );

    /* ---------------- Assertion (gas-safe) ---------------- */
    expect(treasuryBalanceAfter).to.equal(
      treasuryBalanceBefore - withdrawAmount
    );
  });
});
