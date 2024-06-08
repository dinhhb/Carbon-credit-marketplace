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

  describe("Retiring Credits", async () => {
    const tokenSupply = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
    });

    it("should allow a user to retire their credits if they have sufficient balance", async () => {
      const retireAmount = 50;
      const balanceBefore = await tokenContract.balanceOf(seller, 1);

      await retirementContract.retireCredits(1, retireAmount, retirementURI, { from: seller });

      const balanceAfter = await tokenContract.balanceOf(seller, 1);
      assert.equal(balanceAfter.toNumber(), tokenSupply - retireAmount, "The tokens were not retired correctly.");
    });

    it("should fail to retire credits if the user does not have enough tokens", async () => {
      const retireAmount = 150; // More than the supply

      try {
        // Attempt to retire more tokens than available for the second project
        await retirementContract.retireCredits(2, retireAmount, retirementURI, { from: seller });
        assert.fail("The transaction should have failed but didn't.");
      } catch (error) {
        assert.include(error.message, "Insufficient balance", "Expected token balance error but got another error.");
      }
    });

    it("should not allow a user to retire tokens they do not own", async () => {
      const retireAmount = 10;

      // Assuming no tokens of this type have been minted to accounts[2]
      try {
        await retirementContract.retireCredits(2, retireAmount, retirementURI, { from: buyer });
        assert.fail("The transaction should have failed but didn't.");
      } catch (error) {
        assert.include(error.message, "Insufficient balance", "Expected token balance error but got another error.");
      }
    });

    it("should allow buyer to retire their credits", async () => {
      const retireAmount = 10;

      await marketContract.buyCredits(1, retireAmount, { from: buyer, value: price * retireAmount });
      const balanceBefore = await tokenContract.balanceOf(buyer, 1);

      await tokenContract.setApprovalForAll(marketContract.address, true, { from: buyer });
      await retirementContract.retireCredits(1, retireAmount, retirementURI, { from: buyer });

      const balanceAfter = await tokenContract.balanceOf(buyer, 1);
      assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() - retireAmount, "The tokens were not retired correctly.");
    });

    it("should decrease the total credits of the buyer after retiring", async () => {
      const retireAmount = 10;
      await marketContract.buyCredits(1, retireAmount, { from: buyer, value: price * retireAmount });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: buyer });
      const totalCreditsBefore = await accountContract.getAccountTotalCredits(buyer);
      await retirementContract.retireCredits(1, retireAmount, retirementURI, { from: buyer });
      const totalCreditsAfter = await accountContract.getAccountTotalCredits(buyer);
      assert.equal(totalCreditsAfter.toNumber(), totalCreditsBefore.toNumber() - retireAmount, "The total credits of the buyer were not updated correctly.");
    });

    it("should increase the total retired credits of the seller after retiring", async () => {
      const retireAmount = 10;
      await marketContract.buyCredits(1, retireAmount, { from: buyer, value: price * retireAmount });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: buyer });
      const totalRetiredBefore = await accountContract.getAccountTotalRetire(seller);
      await retirementContract.retireCredits(1, retireAmount, retirementURI, { from: seller });
      const totalRetiredAfter = await accountContract.getAccountTotalRetire(seller);
      assert.equal(totalRetiredAfter.toNumber(), totalRetiredBefore.toNumber() + retireAmount, "The total retired credits of the seller were not updated correctly.");
    });
  });

  describe("Certification", async () => {
    const tokenSupply = 100;
    const retireAmount = 50;
    const newUri = "https://newuri.com";

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
      await retirementContract.retireCredits(1, retireAmount, retirementURI, { from: seller });
    });

    it("should get correct certification status", async () => {
      let allRetirements = await retirementContract.getAllRetirements();
      let certificationStatusBefore = allRetirements[0].isCertificated;
      assert.equal(certificationStatusBefore, false, "Certification status is suppose to be false.");
  
      await retirementContract.certificateRetirement(1, newUri, { from: auditor });
  
      allRetirements = await retirementContract.getAllRetirements();
      const certificationStatusAfter = allRetirements[0].isCertificated;
      assert.equal(certificationStatusAfter, true, "Certification status is suppose to be true.");
    });

    it("should get correct certification URI", async () => {
      let certificationUriBefore = await retirementContract.tokenURI(1);
      assert.equal(certificationUriBefore, retirementURI, "Certification URI is suppose to be retirementURI.");
  
      await retirementContract.certificateRetirement(1, newUri, { from: auditor });
  
      const certificationUriAfter = await retirementContract.tokenURI(1);
      assert.equal(certificationUriAfter, newUri, "Certification URI is suppose to be new URI.");
    });

    it("should return correct all retirements", async () => {
      await retirementContract.certificateRetirement(1, newUri, { from: auditor });
      const allRetirements = await retirementContract.getAllRetirements();
      assert.equal(allRetirements.length, 1, "All retirements length is incorrect.");
      assert.equal(allRetirements[0].tokenId, 1, "Retirement token ID is incorrect.");
      assert.equal(allRetirements[0].isCertificated, true, "Certification status is incorrect.");

      const certificationUri = await retirementContract.tokenURI(1);
      assert.equal(certificationUri, newUri, "Certification URI is incorrect.");
    });
  });

  describe("Token Enumeration", async () => {
    const tokenSupply = 150;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
    });

    it("should enumerate tokens correctly", async () => {
      const retireAmount = 50;

      await retirementContract.retireCredits(1, retireAmount, retirementURI, { from: seller });

      const totalSupply = await retirementContract.totalSupply();
      assert.equal(totalSupply.toNumber(), 1, "Total supply is incorrect.");

      const tokenIdByIndex = await retirementContract.tokenByIndex(0);
      assert.equal(tokenIdByIndex.toNumber(), 1, "Token ID by index is incorrect.");

      const tokenOfOwnerByIndex = await retirementContract.tokenOfOwnerByIndex(seller, 0);
      assert.equal(tokenOfOwnerByIndex.toNumber(), 1, "Token of owner by index is incorrect.");
    });

    it("should return all retirements", async () => {
      await retirementContract.retireCredits(1, 50, retirementURI, { from: seller });
      await retirementContract.retireCredits(1, 50, retirementURI, { from: seller });
      await marketContract.buyCredits(1, 10, { from: buyer, value: price * 10 });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: buyer });
      await retirementContract.retireCredits(1, 10, retirementURI, { from: buyer });

      const allRetirements = await retirementContract.getAllRetirements();
      assert.equal(allRetirements.length, 3, "All retirements length is incorrect.");
      assert.equal(allRetirements[0].tokenId, 1, "First retirement token ID is incorrect.");
      assert.equal(allRetirements[1].tokenId, 2, "Second retirement token ID is incorrect.");
      assert.equal(allRetirements[2].tokenId, 3, "Third retirement token ID is incorrect.");
    });

    it("should return owned retirements", async () => {
      await retirementContract.retireCredits(1, 50, retirementURI, { from: seller });
      await retirementContract.retireCredits(1, 50, retirementURI, { from: seller });
      await marketContract.buyCredits(1, 10, { from: buyer, value: price * 10 });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: buyer });
      await retirementContract.retireCredits(1, 10, retirementURI, { from: buyer });

      const ownedRetirements = await retirementContract.getOwnedRetirements({ from: seller });
      assert.equal(ownedRetirements.length, 2, "Owned retirements length is incorrect.");
      assert.equal(ownedRetirements[0].tokenId, 1, "First owned retirement token ID is incorrect.");
      assert.equal(ownedRetirements[1].tokenId, 2, "Second owned retirement token ID is incorrect.");
    });
  });
});