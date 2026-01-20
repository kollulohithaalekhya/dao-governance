const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deploying contracts with:", deployer.address);
  console.log("Account balance:", balance.toString());

  /* ------------------------------------------------------------
     1. Deploy GOVToken
  ------------------------------------------------------------ */
  const GOVToken = await ethers.getContractFactory(
  "contracts/GOVToken.sol:GOVToken"
);

  const token = await GOVToken.deploy(
    "DAO Governance Token",
    "GOV",
    ethers.parseEther("1000000")
  );
  await token.waitForDeployment();
  console.log("GOVToken deployed to:", await token.getAddress());

  /* ------------------------------------------------------------
     2. Deploy Timelock
  ------------------------------------------------------------ */
  const minDelay = 60; // 1 minute
  const proposers = [];
  const executors = [];
  const Timelock = await ethers.getContractFactory(
  "contracts/DAOTimelock.sol:DAOTimelock"
);
  const timelock = await Timelock.deploy(minDelay, proposers, executors);
  await timelock.waitForDeployment();
  console.log("Timelock deployed to:", await timelock.getAddress());

  /* ------------------------------------------------------------
     3. Deploy Governor
  ------------------------------------------------------------ */
  const Governor = await ethers.getContractFactory(
  "contracts/DAOGovernor.sol:DAOGovernor"
);

  const governor = await Governor.deploy(
    await token.getAddress(),
    await timelock.getAddress(),
    deployer.address
  );
  await governor.waitForDeployment();
  console.log("Governor deployed to:", await governor.getAddress());

  /* ------------------------------------------------------------
     4. Deploy Treasury
  ------------------------------------------------------------ */

const Treasury = await ethers.getContractFactory(
  "contracts/Treasury.sol:Treasury"
);

  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  console.log("Treasury deployed to:", await treasury.getAddress());

  /* ------------------------------------------------------------
     5. Setup Timelock Roles
  ------------------------------------------------------------ */
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

  await timelock.grantRole(PROPOSER_ROLE, await governor.getAddress());
  await timelock.grantRole(EXECUTOR_ROLE, await governor.getAddress());
  await timelock.grantRole(EXECUTOR_ROLE, ethers.ZeroAddress);

  await timelock.revokeRole(TIMELOCK_ADMIN_ROLE, deployer.address);

  console.log("Timelock roles configured");

  /* ------------------------------------------------------------
     6. Transfer Treasury ownership
  ------------------------------------------------------------ */
  await treasury.transferOwnership(await timelock.getAddress());
  console.log("Treasury ownership transferred to Timelock");

  console.log("✅ Deployment completed successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
