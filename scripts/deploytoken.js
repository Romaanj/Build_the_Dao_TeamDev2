const { ethers } = require("hardhat");

const deployGovernanceToken = async function () {
  const [deployer] = await ethers.getSigners();
  
  console.log("----------------------------------------------------");
  console.log("Deploying GovernanceToken...");
  
  // Deploy the GovernanceToken contract
  const governanceToken = await ethers.deployContract("GovernanceToken");
  console.log(governanceToken);
  console.log(`GovernanceToken at ${governanceToken.target}`);

  console.log(`Delegating to ${deployer.address}`);
  // Delegate to deployer
  await delegate(governanceToken.target, deployer.address);
  console.log("Delegated!");
};

const delegate = async (governanceTokenAddress, delegatedAccount) => {
  // Delegate to deployer
  const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
  // Checkpoints: 0
  // Delegate to deployer
  const transactionResponse = await governanceToken.delegate(delegatedAccount);
  await transactionResponse.wait(1);
  // Checkpoints: 1
  console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`);
};

deployGovernanceToken()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });
