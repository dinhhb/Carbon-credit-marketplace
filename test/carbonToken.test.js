const CarbonToken = artifacts.require("CarbonToken");
const AccountManagement = artifacts.require("AccountManagement");
const CarbonMarket = artifacts.require("CarbonMarket");
const ProjectManagement = artifacts.require("ProjectManagement");
const Retirement = artifacts.require("Retirement");

contract("Retirement", async accounts => {
  let tokenContract = null;
  let accountContract = null;
  let marketContract = null;
  let projectContract = null;
  let retirementContract = null;
  const tokenURI = "https://test.com";
  const retirementURI = "https://retire.com";
  const admin = accounts[0];
  const auditor = accounts[1];
  const seller = accounts[2];
  const buyer = accounts[3];
  const totalCredits = 150;
  const price = web3.utils.toWei("0.001", "ether");

  beforeEach(async () => {
    tokenContract = await CarbonToken.new();
    accountContract = await AccountManagement.new(tokenContract.address);
    marketContract = await CarbonMarket.new(tokenContract.address, accountContract.address);
    retirementContract = await Retirement.new(marketContract.address);
    projectContract = await ProjectManagement.new(tokenContract.address, accountContract.address, marketContract.address);
    await accountContract.setAuthorizedContract(marketContract.address);

    await accountContract.registerAccount(seller, totalCredits, false, { from: admin });
    await accountContract.registerAccount(auditor, 0, true, { from: admin });
    await accountContract.registerAccount(buyer, 0, false, { from: admin });
  });

  describe("Getting Credit By Index", async () => {
    const tokenSupply = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });  // Project 1
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });

      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });  // Project 2
      await projectContract.declineProject(2, { from: auditor });

      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });  // Project 3
    });

    it("should get 3 credit created", async () => {
      const totalSupply = await tokenContract.getTotalTokensCount();
      assert.equal(totalSupply, 3, "The total supply does not match the expected value");
    });

    it("should get the correct credit by index", async () => {
      const creditId = await tokenContract.getTokenByIndex(0);
      assert.equal(creditId, 1, "The token ID does not match the expected value");
    });

    it("should throw an error when the index is out of bounds", async () => {
      try {
        await tokenContract.getTokenByIndex(tokenSupply);
        assert.fail("The expected error was not thrown");
      } catch (err) {
        assert.include(err.message, "Index out of bounds", "The error message does not match the expected value");
      }
    });
  });

  describe("Getting All Listed Credits", async () => {
    const tokenSupply = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });

      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await projectContract.declineProject(2, { from: auditor });

      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await projectContract.approveProject(3, { from: auditor });
    });

    it("should get all listed credits", async () => {
      const listedCredits = await marketContract.getAllListedCredits();
      assert.equal(listedCredits.length, 2, "The number of listed credits does not match the expected value");

      for (let i = 0; i < listedCredits.length; i++) {
        // console.log(listedCredits[i]);
        assert.equal(listedCredits[i].isListed, true, "The isListed value of a listed credit is not correct");
      }
    });
  });

  describe("Getting Owned Credits", async () => {
    const tokenSupply = 100;
    const buyAmount = 10;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });  // Project 1
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });

      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });  // Project 2
      await projectContract.approveProject(2, { from: auditor });

      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: price * buyAmount });
      await marketContract.buyCredits(2, buyAmount, { from: buyer, value: price * buyAmount });

      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });  // Project 3
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });  // Project 4
      await projectContract.declineProject(3, { from: auditor });
    });

    it("should get the correct owned credits for the seller", async () => {
      const ownedCredits = await tokenContract.getOwnedCredits({ from: seller });
      assert.equal(ownedCredits.length, 4, "Seller should own credits from 4 projects");
    });

    it("should get the correct owned credits for the buyer", async () => {
      const ownedCredits = await tokenContract.getOwnedCredits({ from: buyer });
      assert.equal(ownedCredits.length, 2, "Buyer should own credits from 2 projects");

    });

    it("should get the correct quantity of each credit type of buyer", async () => {
      // Query the balance of each token type for the buyer
      const balanceToken1 = await tokenContract.balanceOf(buyer, 1);
      const balanceToken2 = await tokenContract.balanceOf(buyer, 2);
      // console.log(balanceToken1.toNumber());
      // console.log(balanceToken2.toNumber());

      // Assert that the buyer owns the correct amount of each token type
      assert.equal(balanceToken1.toNumber(), buyAmount, `Buyer should own ${buyAmount} of credit 1`);
      assert.equal(balanceToken2.toNumber(), buyAmount, `Buyer should own ${buyAmount} of credit 2`);
    });
  });

  describe("All Tokens Enumeration Removal", async () => {
    const tokenSupply = 100;
    const retireAmount = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
    });

    it("should remove the token from all tokens enumeration when all units are burned", async () => {
      await retirementContract.retireCredits(1, retireAmount, retirementURI, { from: seller });  // retire all credits

      const totalTokens = await tokenContract.getTotalTokensCount();
      assert.equal(totalTokens.toNumber(), 0, "The total tokens count should be zero after burning all tokens of a type");
      const ownedTokens = await tokenContract.getOwnedTokensCount(seller);
      assert.equal(ownedTokens.toNumber(), 0, "The owned tokens count should be zero after burning all tokens of a type");
    });
  });

  describe("Token Supply and Burn Operations", async () => {
    const tokenSupply = 100;
    const burnAmount = 20;
    const tokenId = 1;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(tokenId, { from: auditor });
    });

    it("should return the correct initial token supply", async () => {
      const supply = await tokenContract.getTokenSupply(tokenId);
      assert.equal(supply.toNumber(), tokenSupply, "The initial token supply is incorrect.");
    });

    it("should decrease the token supply after burning tokens", async () => {
      await retirementContract.retireCredits(tokenId, burnAmount, retirementURI, { from: seller });
      const supplyAfterBurn = await tokenContract.getTokenSupply(tokenId);
      assert.equal(supplyAfterBurn.toNumber(), tokenSupply - burnAmount, "The token supply did not decrease correctly after burning tokens.");
    });

    it("should not allow burning more tokens than the owner possesses", async () => {
      try {
        await retirementContract.retireCredits(tokenId, tokenSupply + 1, retirementURI, { from: seller });
        assert.fail("The transaction should have failed but didn't.");
      } catch (error) {
        assert.include(error.message, "Insufficient balance", "Expected token balance error but got another error.");
      }
    });
  });

  describe("Token Ownership Tracking", async () => {
    const tokenSupply = 100;
    const buyAmount = 10;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
    });

    it("should track new owner upon minting", async () => {
      let owners = await tokenContract.getTokenOwners(1);
      assert.equal(owners.includes(seller), true, "Account 0 should be listed as an owner after project approval");
      assert.equal(await tokenContract.getOwnerCount(1), 1, "Owner count should be exactly 1");
    });

    it("should add a new owner upon transfer", async () => {
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: price * buyAmount });
      let owners = await tokenContract.getTokenOwners(1);
      assert.equal(owners.includes(buyer), true, "Account 1 should be listed as an owner after transfer");
      assert.equal(await tokenContract.getOwnerCount(1), 2, "Owner count should be 2");
    });

    it("should remove owner when all their tokens are transferred", async () => {
      await marketContract.buyCredits(1, tokenSupply, { from: buyer, value: price * tokenSupply });
      let owners = await tokenContract.getTokenOwners(1);
      // console.log(owners);
      assert.equal(owners.includes(seller), false, "Account 0 should no longer be listed as an owner after transferring all tokens");
      assert.equal(await tokenContract.getOwnerCount(1), 1, "Owner count should be 1 with account 1 as the sole owner");
    });

    it("should correctly handle ownership when tokens are burned", async () => {
      let initialOwnerCount = await tokenContract.getOwnerCount(1);
      assert.equal(initialOwnerCount, 1, "Initial owner count should be 1");

      await retirementContract.retireCredits(1, tokenSupply, retirementURI, { from: seller });

      let finalOwnerCount = await tokenContract.getOwnerCount(1);
      assert.equal(finalOwnerCount, 0, "Owner count should return to 0 after burning all tokens");

      let owners = await tokenContract.getTokenOwners(1);
      assert.equal(owners.length, 0, "No owners should remain after all tokens are burned");
    });

  });

  describe("Token balance after buying", async () => {
    const tokenSupply = 100;
    const buyAmount = 10;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
    });

    it("should return the correct balance of the buyer after buying", async () => {
      const initialBalance = await tokenContract.balanceOf(buyer, 1);
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: price * buyAmount });
      const finalBalance = await tokenContract.balanceOf(buyer, 1);
      assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + buyAmount, "The balance of the buyer is not correct after buying");
    });
  });

});