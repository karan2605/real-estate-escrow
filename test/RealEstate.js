const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe("RealEstate", () => {
  let realEstate, escrow;
  let deployer, seller;
  let nftID = 1;
  let purchasePrice = ether(100)
  let escrowAmount = ether(20)

  beforeEach(async () => {
    // Setup accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];
    inspector = accounts[2];
    lender = accounts[3];

    // Load Contracts
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    // Deploy contracts
    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      purchasePrice,
      escrowAmount,
      seller.address,
      buyer.address,
      inspector.address,
      lender.address
    );

    // Seller approves NFT
    transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, nftID);
    await transaction.wait();
  });

  describe("Deployment", async () => {
    it("sends an NFT to the seller / deployer", async () => {
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);
    });
  });

  describe("Selling real estate", async () => {
    it("executes a successful transaction", async () => {
      // Expect seller to be NFT owner before the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      // Buyer deposits earnest
      transaction = await escrow.connect(buyer).depositEarnest({ value : escrowAmount })

      // Check escrow balance
      balance = await escrow.getBalance()
      console.log("escrow balance:", ethers.utils.formatEther(balance))
      
      // Finalize sale
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Buyer finalizes sale");

      // Expects that the buyer is the owner of the NFT after the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
    });
  });
});
