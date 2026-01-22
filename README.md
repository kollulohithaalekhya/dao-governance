# DAO Governance System

A complete on-chain DAO governance system built using **Solidity**, **Hardhat**, and **OpenZeppelin**.  
The system enables token-based voting, proposal execution via a timelock, and a DAO-controlled treasury.

---

## Features

- ERC20 governance token with snapshot-based voting  
- On-chain proposal creation and voting  
- Timelock-controlled execution for security  
- DAO-controlled treasury  
- Off-chain vote attestation support  
- Fully tested governance lifecycle  
- Optimized compilation using Solidity IR  

---

## Architecture Overview

### Contracts

| Contract          | Description                                      |
|-------------------|--------------------------------------------------|
| GOVToken.sol      | ERC20 governance token using ERC20Votes          |
| DAOGovernor.sol   | Core governance logic (proposals, voting, quorum)|
| DAOTimelock.sol   | Enforces execution delay on approved proposals   |
| Treasury.sol      | Holds ETH, withdrawals only via governance       |

---

## Governance Flow

1. Token holders delegate voting power  
2. A proposal is created  
3. Token holders vote  
4. Proposal passes quorum & majority  
5. Off-chain votes are attested  
6. Proposal is queued in Timelock  
7. After delay, proposal is executed  
8. Treasury action (e.g., ETH withdrawal) occurs  

---

## Design Decisions

### Why Timelock?
- Prevents instant execution  
- Gives users time to react  
- Protects against malicious proposals  

### Why ERC20Votes?
- Snapshot-based voting  
- Prevents vote manipulation  
- Widely used in production DAOs  

### Why viaIR?
- Governor contracts exceed EVM bytecode limit  
- IR compilation reduces bytecode size  
- Recommended for large governance contracts  

---

## Tech Stack

- Solidity 0.8.20  
- Hardhat  
- OpenZeppelin Contracts v4.9.5  
- Ethers.js v6  
- Mocha / Chai for testing  

---

## Installation

```bash
git clone <your-repo-url>
cd dao-governance
npm install
```

---

## Compile Contracts

```bash
npx hardhat compile
```

---

## Deploy Contracts (Local)

```bash
npx hardhat run scripts/deploy.js
```

Expected output:

```
GOVToken deployed to: ...
Timelock deployed to: ...
Governor deployed to: ...
Treasury deployed to: ...
Deployment completed successfully
```

---

## Run Tests

```bash
npx hardhat test
```

Expected:

```
1 passing
```

The test covers:
- Token delegation  
- Proposal creation  
- Voting  
- Timelock queue & execution  
- Treasury ETH withdrawal  

---

## Security Considerations

- Treasury owned by Timelock, not EOAs  
- Governor is the only proposer  
- Admin role revoked after setup  
- Snapshot voting prevents flash-loan attacks  

---

## Future Improvements

- Frontend UI (React + ethers)  
- Multisig off-chain attestation  
- Quadratic voting  
- DAO member dashboard  
- On-chain proposal metadata storage  

---