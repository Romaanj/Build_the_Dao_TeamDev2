const {ethers} = require("hardhat");
require('dotenv').config;
const {NEW_STORE_VALUE,developmentChains,MIN_DELAY,PROPOSAL_DESCRIPTION,FUNC} = process.env;

const queueAndExecute = async function() {
    const args = [NEW_STORE_VALUE];
    // Get the box contract
    const box = await ethers.getContractAt("Box","Deployed Box address");
    // Encode the function call to change the box value to 77
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC,args);
    //  Get the proposal description hash
    const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(PROPOSAL_DESCRIPTION));

    // Get the governor contract
    const governor = await ethers.getContractAt("GovernorContract","Deployed Governor address");
    console.log("----------------------------------------------------");
    console.log("Queueing...");

    // Queue the proposal
    const queueTx = await governor.queue(
        [box.target],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );

    await queueTx.wait(1);

    // Move blocks to the execute
    if (developmentChains.includes(network.name)) {
        await moveTime(3600 + 1);
        await moveBlocks(2);
    };
    console.log("----------------------------------------------------");

    console.log("Executing...");
    // Execute the proposal
    const executeTx = await governor.execute(
        [box.target],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );

    await executeTx.wait(1);
    
    const BoxNewValue = await box.retrieve();
    console.log(`New Box Value : ${BoxNewValue.toString()}`);
}

queueAndExecute()
    .then(()=>process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
});

async function moveTime(amount) {
    console.log("Moving Time...");
    await network.provider.request({
        method: "evm_increaseTime",
        params: [amount],
    });
    console.log(`Time Moved ${amount} seconds`);
};

async function moveBlocks(amount) {
    console.log("Moving Blocks...");
    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        });
    }
};