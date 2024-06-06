const CarbonToken = artifacts.require("CarbonToken");
const AccountManagement = artifacts.require("AccountManagement");
const CarbonMarket = artifacts.require("CarbonMarket");
const ProjectManagement = artifacts.require("ProjectManagement");

contract("ProjectManagement", async accounts => {
  let tokenContract = null;
  let accountContract = null;
  let marketContract = null;
  let projectContract = null;
  const tokenURI = "https://test.com";
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
    projectContract = await ProjectManagement.new(tokenContract.address, accountContract.address, marketContract.address);
    await accountContract.setAuthorizedContract(marketContract.address);

    await accountContract.registerAccount(seller, totalCredits, false, { from: admin });
    await accountContract.registerAccount(auditor, 0, true, { from: admin });
    await accountContract.registerAccount(buyer, 0, false, { from: admin });
  });

  describe("Project Registration", async () => {
    const tokenSupply = 100;

    it("should register a new carbon credit project", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      const carbonCredit = await tokenContract.getCarbonCredit(1);

      assert.equal(Number(carbonCredit.tokenId), 1, "Token ID is not correct");
      assert.equal(carbonCredit.initialOwner, seller, "Owner is not correct");
      assert.equal(Number(carbonCredit.status), 0, "Status is not correct");
      assert.equal(Number(carbonCredit.pricePerCredit), price, "Price per credit is not correct");
      assert.equal(carbonCredit.isListed, false, "Is listed is not correct");
    });

    it("first token should point to the correct URI", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      const uri = await tokenContract.uri(1);
      assert.equal(uri, tokenURI, "The URI of the token does not match the expected value");
    }
    );

    it("should revert when token supply exceeds total credits", async () => {
      try {
        await projectContract.registerProject(totalCredits + 1, tokenURI, price, { from: seller });
        assert.fail("The transaction should have failed but didn't");
      } catch (error) {
        assert(error.message.includes("Token supply invalid"), "Expected an error but got a different one");
      }
    });

  });

  describe("Project Approval", async () => {
    const tokenSupply = 100;

    it("should mint tokens correctly", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
      const initialBalance = await tokenContract.balanceOf(seller, 1);
      assert.equal(initialBalance.toNumber(), tokenSupply, "The initial balance is not correct");
    });

    it("should approve a carbon credit project", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
      const carbonCredit = await tokenContract.getCarbonCredit(1);
      assert.equal(Number(carbonCredit.status), 1, "Status is not correct");
    });

    it("should only allow the auditor to approve a project", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      try {
        await projectContract.approveProject(1, { from: admin }); // Wrong case
        assert.fail("The transaction should have failed but didn't");
      } catch (error) {
        assert(error.message.includes("Invalid auditor"), "Expected an error but got a different one");
      }
    });

    it("should list credits for sale", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
      const credit = await tokenContract.getCarbonCredit(1);

      assert.equal(credit.isListed, true, "The credit is not listed for sale.");
      assert.equal(Number(credit.pricePerCredit), price, "The price per credit is not correct.");
    });
  });

  describe("Project Declination", async () => {
    const tokenSupply = 100;

    it("should decline the project", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await projectContract.declineProject(1, { from: auditor });
      const credit = await tokenContract.getCarbonCredit(1);
      assert.equal(Number(credit.status), 2, "The project status does not match the expected value");
    });
  });
});