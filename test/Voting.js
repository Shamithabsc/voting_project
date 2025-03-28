const { expect } = require("chai");

describe("Voting", function () {
    let Voting;
    let voting;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        Voting = await ethers.getContractFactory("Voting");
        [owner, addr1, addr2] = await ethers.getSigners();
        voting = await Voting.deploy();
        await voting.deployed();
    });

    it("Should initialize with three candidates", async function () {
        const candidate1 = await voting.candidates(1);
        const candidate2 = await voting.candidates(2);
        const candidate3 = await voting.candidates(3);
        expect(candidate1.name).to.equal("Alice");
        expect(candidate2.name).to.equal("Bob");
        expect(candidate3.name).to.equal("Charlie");
    });

    it("Should allow adding a voter", async function () {
        await voting.addVoter(addr1.address);
        const isVoter = await voting.registeredVoters(addr1.address);
        expect(isVoter).to.be.true;
    });

    it("Should not allow adding the same voter twice", async function () {
        await voting.addVoter(addr1.address);
        await expect(voting.addVoter(addr1.address)).to.be.revertedWith("Voter already added.");
    });

    it("Should allow a registered voter to vote", async function () {
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).vote(1);
        const candidate1 = await voting.candidates(1);
        expect(candidate1.voteCount).to.equal(1);
    });

    it("Should not allow an unregistered voter to vote", async function () {
        await expect(voting.connect(addr2).vote(1)).to.be.revertedWith("You are not a registered voter.");
    });

    it("Should not allow double voting", async function () {
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).vote(1);
        await expect(voting.connect(addr1).vote(1)).to.be.revertedWith("You have already voted.");
    });

    it("Should announce the winner correctly", async function () {
        await voting.addVoter(addr1.address);
        await voting.connect(addr1).vote(1);
        const [winnerName, winnerVoteCount] = await voting.announceWinner();
        expect(winnerName).to.equal("Alice");
        expect(winnerVoteCount).to.equal(1);
    });
});
