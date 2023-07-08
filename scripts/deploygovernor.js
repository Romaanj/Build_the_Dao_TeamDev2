require('dotenv').config();
const { ethers } = require("hardhat")
const {VOTING_DELAY, VOTING_PERIOD, PROPOSAL_THRESHOLD, QUORUM_PERCENTAGE} = process.env;

const deployGovernorContract = async function()  { 
    const [deployer] = await ethers.getSigners();

    console.log("----------------------------------------------------");
    console.log("Deploying Governor...");

    // Deploy the Governor contract
    const MyGovernor = await ethers.deployContract("GovernorContract",
    ["Deployed Token address", // GovernanceToken.address
    "Deployed TimeLock address", // TimeLock.address
    VOTING_DELAY,
    VOTING_PERIOD,
    PROPOSAL_THRESHOLD,
    QUORUM_PERCENTAGE]);

    console.log(`Governor contract at ${MyGovernor.target}`);
    console.log(`Deployed by ${deployer.address}`);
 }
 
 deployGovernorContract()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });