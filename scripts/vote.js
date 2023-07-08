const fs = require("fs");
const { network, ethers } = require("hardhat");
require("dotenv").config();
const {VOTING_PERIOD} = process.env;

const index = 0;
async function vote(proposal_Index) {
    const proposals = await JSON.parse(fs.readFileSync(process.env.proposalsFile,"utf8"));
    
    // get the proposal ID from the proposals.json file
    const proposalId = proposals[network.config.chainId][proposal_Index];
    
    // `support=bravo` refers to the vote options 0 = Against, 1 = For, 2 = Abstain, as in `GovernorBravo`
    // 0 = Against(반대), 1 = For(찬성), 2 = Abstain(기권)
    const voteWay = 1;
    // Get the governor contract
    const governor = await ethers.getContractAt("GovernorContract","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    
    // Vote on the proposal
    console.log("----------------------------------------------------");
    console.log("Voting....");
    
    const voteTx = await governor.castVote(proposalId,voteWay);
    await voteTx.wait(1);

    // Move blocks to the end of the voting period
    if(process.env.developmentChains.includes(network.name)) {
        await moveBlocks(11);
    }

    console.log("Voted!! Ready to Go!!");
};


vote(index)
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