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

      // Check escrow balance
      balance = await escrow.getBalance()
      console.log("escrow balance:", ethers.utils.formatEther(balance))
      
      // Buyer deposits earnest
      console.log("Buyer deposits earnest money")
      transaction = await escrow.connect(buyer).depositEarnest({ value : escrowAmount })
      await transaction.wait()

      // Check escrow balance
      balance = await escrow.getBalance()
      console.log("escrow balance:", ethers.utils.formatEther(balance))

      // Inspector updates status
      transaction = await escrow.connect(inspector).updateInspectionStatus(true)
      await transaction.wait()
      console.log("Inspector updates status")

      // Buyer approves sale
      transaction = await escrow.connect(buyer).approveSale()
      await transaction.wait()
      console.log("Buyer approves sale")

      // Seller approves sale
      transaction = await escrow.connect(seller).approveSale()
      await transaction.wait()
      console.log("Seller approves sale")

      // Lender approves sale
      transaction = await escrow.connect(lender).approveSale()
      await transaction.wait()
      console.log("Lender approves sale")
      
      // Finalize sale
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Buyer finalizes sale");

      // Expects that the buyer is the owner of the NFT after the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
    });
  });
});
