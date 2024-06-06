const CarbonToken = artifacts.require("CarbonToken");
const AccountManagement = artifacts.require("AccountManagement");
const CarbonMarket = artifacts.require("CarbonMarket");
const ProjectManagement = artifacts.require("ProjectManagement");

contract("CarbonMarket", async accounts => {
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

  describe("Delist Credits", async () => {
    const tokenSupply = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
    });

    it("should delist the credits", async () => {
      await marketContract.delistCredits(1, { from: seller });
      const credit = await tokenContract.getCarbonCredit(1);
      assert.equal(credit.isListed, false, "The credit is not delisted.");
    });
  });

  describe("Changing Price", async () => {
    const tokenSupply = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
    });

    it("should change the price of the credits", async () => {
      const newPrice = web3.utils.toWei("0.002", "ether");
      await marketContract.changePrice(1, newPrice, { from: seller });
      const credit = await tokenContract.getCarbonCredit(1);
      assert.equal(Number(credit.pricePerCredit), newPrice, "The price of the credit is not correct.");
    });
  });

  describe("Listing Credits", async () => {
    const tokenSupply = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1,  { from: auditor });
      await marketContract.delistCredits(1, { from: seller });
    });

    it("should list the credits again", async () => {
      const newPrice = web3.utils.toWei("0.002", "ether");
      await marketContract.listCreditsForSale(1, newPrice, { from: seller });
      const credit = await tokenContract.getCarbonCredit(1);
      assert.equal(credit.isListed, true, "The credit is not listed.");
      assert.equal(Number(credit.pricePerCredit), newPrice, "The price of the credit is not correct.");
    });
  });

  describe("Getting Listed Tokens Count", async () => {
    const tokenSupply = 100;

    it("should get the correct count of listed tokens", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });
      const count = await marketContract.getListedTokensCount();
      assert.equal(Number(count), 1, "The count of listed tokens does not match the expected value");
    });
  });

  describe("Buying Credits", async () => {
    const tokenSupply = 100;
    const salePrice = web3.utils.toWei("0.001", "ether");
    const buyAmount = 50;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, price, { from: seller });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await projectContract.approveProject(1, { from: auditor });

    });

    it("should allow a user to buy credits", async () => {
      const initialSellerBalance = await tokenContract.balanceOf(seller, 1);
      const initialBuyerBalance = await tokenContract.balanceOf(buyer, 1);

      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });

      const finalSellerBalance = await tokenContract.balanceOf(seller, 1);
      const finalBuyerBalance = await tokenContract.balanceOf(buyer, 1);

      assert.equal(finalSellerBalance.toNumber(), initialSellerBalance.toNumber() - buyAmount, "Seller's balance did not decrease correctly");
      assert.equal(finalBuyerBalance.toNumber(), initialBuyerBalance.toNumber() + buyAmount, "Buyer's balance did not increase correctly");
    });

    it("should not allow a user to buy more credits than available", async () => {
      try {
        await marketContract.buyCredits(1, tokenSupply + 1, { from: buyer, value: salePrice * (tokenSupply + 1) });
        assert.fail("The transaction should have failed but didn't");
      } catch (error) {
        assert(error.message.includes("Insufficient balance."), "Expected an error but got a different one");
      }
    });

    it("should not allow a user to buy credits without enough funds", async () => {
      try {
        await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount - web3.utils.toWei("0.0001", "ether") });
        assert.fail("The transaction should have failed but didn't");
      } catch (error) {
        assert(error.message.includes("Insufficient funds."), "Expected an error but got a different one");
      }
    });

    it("should update the CarbonCredit struct after all tokens are bought", async () => {
      await marketContract.buyCredits(1, tokenSupply, { from: buyer, value: salePrice * tokenSupply });
      const credit = await tokenContract.getCarbonCredit(1);

      const finalOwnerBalance = await tokenContract.balanceOf(seller, 1);
      const finalBuyerBalance = await tokenContract.balanceOf(buyer, 1);

      assert.equal(finalOwnerBalance.toNumber(), 0, "Initial owner should have no tokens left.");
      assert.equal(finalBuyerBalance.toNumber(), tokenSupply, "Buyer should own all tokens.");
      assert.equal(credit.isListed, false, "Credit should no longer be listed.");

    });

    it("should decrease the listed tokens count after all tokens are bought", async () => {
      await marketContract.buyCredits(1, tokenSupply, { from: buyer, value: salePrice * tokenSupply });
      const count = await marketContract.getListedTokensCount();
      assert.equal(count, 0, "The count of listed tokens should be updated.");
    });

    it("should update the quantity of token sold after a purchase", async () => {
      const initialTokenSold = await tokenContract.getTokenSold(1);
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });
      const afterTokenSold = await tokenContract.getTokenSold(1);

      assert.equal(initialTokenSold, 0, "Initial token sold should be 0.");
      assert.equal(afterTokenSold, buyAmount, "Token sold should be updated after a purchase.");
    });

    it("should have correct balance after buying", async () => {
      const initialBalance = await tokenContract.balanceOf(buyer, 1);
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });
      const finalBalance = await tokenContract.balanceOf(buyer, 1);
      assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + buyAmount, "The balance of the buyer is not correct after buying");
    });

    it("should transfer Ether to the seller when credits are bought", async () => {
      const initialSellerEthBalance = web3.utils.toBN(await web3.eth.getBalance(seller));
      const transactionValue = web3.utils.toBN(salePrice * buyAmount);
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: transactionValue });
      const finalSellerEthBalance = web3.utils.toBN(await web3.eth.getBalance(seller));
      const expectedSellerBalance = initialSellerEthBalance.add(transactionValue);
      assert.equal(finalSellerEthBalance.toString(), expectedSellerBalance.toString(), "Ether not correctly transferred to the seller.");
    });

    it("should decrease total credits of seller after buying", async () => {
      const initialTotal = await accountContract.getAccountTotalCredits(seller);
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });
      const finalTotal = await accountContract.getAccountTotalCredits(seller);
      assert.equal(finalTotal.toNumber(), initialTotal.toNumber() - buyAmount, "The total credits is not correct");
    });

    it("should increase total credits of buyer after buying", async () => {
      const initialTotal = await accountContract.getAccountTotalCredits(buyer);
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });
      const finalTotal = await accountContract.getAccountTotalCredits(buyer);
      assert.equal(finalTotal.toNumber(), initialTotal.toNumber() + buyAmount, "The total credits is not correct");
    });
  });
});
