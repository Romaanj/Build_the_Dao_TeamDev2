const { ethers } = require("hardhat");

const deployTimeLock = async function() {
    const [deployer] = await ethers.getSigners();

    console.log("----------------------------------------------------");
    console.log("Deploying TimeLock...");

    // Deploy the TimeLock contract
    const timelock = await ethers.deployContract("TimeLock",[3600,[],[],deployer.address]);
    await timelock.waitForDeployment();

    console.log(`TimeLock contract at ${timelock.target}`);
    console.log(`Deployed by ${deployer.address}`);
}

deployTimeLock()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });