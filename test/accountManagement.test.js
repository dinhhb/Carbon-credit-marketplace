const CarbonToken = artifacts.require("CarbonToken");
const AccountManagement = artifacts.require("AccountManagement");

contract("AccountManagement", async accounts => {
  let tokenContract = null;
  let accountContract = null;
  let marketContract = null;
  let projectContract = null;
  const admin = accounts[0];
  const auditor = accounts[1];
  const seller = accounts[2];
  const buyer = accounts[3];
  const totalCredits = 150;

  beforeEach(async () => {
    tokenContract = await CarbonToken.new();
    accountContract = await AccountManagement.new(tokenContract.address);

    await accountContract.registerAccount(seller, totalCredits, false, { from: admin });
    await accountContract.registerAccount(auditor, 0, true, { from: admin });
    await accountContract.registerAccount(buyer, 0, false, { from: admin });
  });

  describe("Account Registration", async () => {
    it("should register a new user account", async () => {
      await accountContract.registerAccount(buyer, totalCredits, false, { from: admin });
      const userAccounts = await accountContract.getAllAccounts();
      assert.equal(userAccounts[0].addr, seller, "The seller account was not registered correctly");
      assert.equal(userAccounts[1].addr, auditor, "The auditor account was not registered correctly");
      assert.equal(userAccounts[2].addr, buyer, "The buyer account was not registered correctly");
    });

    it("should register user account with correct total credits", async () => {
      await accountContract.registerAccount(seller, totalCredits, false, { from: admin });
      const total = await accountContract.getAccountTotalCredits(seller);
      assert.equal(total, totalCredits, "The total credits is not correct");
    });

    it("should get correct user account address", async () => {
      await accountContract.registerAccount(buyer, totalCredits, false, { from: admin });
      const user = await accountContract.getAccountByAddress(buyer);
      assert.equal(user.addr, buyer, "The account address is not correct");
    });

    it("should register a new auditor", async () => {
      const isAuditor = await accountContract.isAuditor(auditor);
      assert.equal(isAuditor, true, "The auditor was not registered correctly");
    });

    it("should only allow the admin to register a new auditor", async () => {
      try {
        await accountContract.registerAccount(auditor, 0, true, { from: seller });
        assert.fail("The transaction should have failed but didn't");
      } catch (error) {
        assert(error.message.includes("Ownable: caller is not the owner"), "Expected an error but got a different one");
      }
    });

    it("should get the correct accounts", async () => {
      await accountContract.registerAccount(accounts[4], 0, true, { from: admin });
      const allAccounts = await accountContract.getAllAccounts();
      assert.equal(allAccounts.length, 4, "The number of accounts is not correct");
      assert.equal(allAccounts[0].addr, seller, "The seller account was not registered correctly");
      assert.equal(allAccounts[1].addr, auditor, "The auditor account was not registered correctly");
      assert.equal(allAccounts[2].addr, buyer, "The buyer account was not registered correctly");
      assert.equal(allAccounts[3].addr, accounts[4], "The new account was not registered correctly");
    });

    it("should remove an account", async () => {
      await accountContract.registerAccount(accounts[4], 0, true, { from: admin });
      await accountContract.removeAccount(accounts[4], { from: admin });
      const allAccounts = await accountContract.getAllAccounts();
      assert.equal(allAccounts.length, 3, "The number of accounts is not correct");
    });
  });
});