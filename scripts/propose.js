const fs = require("fs");
require("dotenv").config();
const { Func,NEW_STORE_VALUE,PROPOSAL_DESCRIPTION,developmentChains } = process.env;
const {ethers,network} = require("hardhat");

const propose = async function(functionToCall,args,proposalDescription) {
    // Get the governor and box contracts
    const governor = await ethers.getContractAt("GovernorContract","Deployed Governor address"); // GovernorContract.address
    const box = await ethers.getContractAt("Box","Deployed Box address"); // BOX.address
    
    // Encode the function call to change the box value to 77
    // const encodedFunctionCall = box.interface.encodeFunctionData("store", [77]);
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall,args);
    
    console.log("----------------------------------------------------");
    console.log(`Proposing ${functionToCall} on ${box.target} with ${args}`);
    console.log(`Proposal Description: \n ${proposalDescription}`);

    // Propose "Change the Box Value to 77";
    const proposeTx = await governor.propose(
        [box.target],
        [0],
        [encodedFunctionCall],
        proposalDescription
    );
    await proposeTx.wait(1);
    
    // Get the proposal ID
    const proposalId = await governor.hashProposal(
        [box.target],
        [0],
        [encodedFunctionCall],
        ethers.keccak256(ethers.toUtf8Bytes(proposalDescription)));
    
    console.log("Propose successfully created!");
    console.log("----------------------------------------------------");

    // Move blocks to the start of the voting period
    if (developmentChains.includes(network.name)) {
        await moveBlocks(3);
    };

    // Get the proposal state, snapshot, and deadline
    const proposalState = await governor.state(proposalId);
    const proposalSnapShot = await governor.proposalSnapshot(proposalId);
    const proposalDeadline = await governor.proposalDeadline(proposalId);

    // the Proposal State is an enum data type, defined in the IGovernor contract.
  // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
    console.log(`Current Proposal State: ${proposalState}`);
  // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
  // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`);

    
    let proposals = JSON.parse(fs.readFileSync(process.env.proposalsFile,"utf8"));
    proposals[network.config.chainId.toString()].push(proposalId.toString());
    fs.writeFileSync(process.env.proposalsFile,JSON.stringify(proposals));
}

propose(Func,[NEW_STORE_VALUE],PROPOSAL_DESCRIPTION)
    .then(()=>process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
});

async function moveBlocks(amount) {
    console.log("Moving Blocks...");
    
    for (let index = 0; index<amount; index++ ) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        });
    }
};