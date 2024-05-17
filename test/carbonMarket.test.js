const CarbonToken = artifacts.require("CarbonToken");
const ProjectManagement = artifacts.require("ProjectManagement");
const CarbonMarket = artifacts.require("CarbonMarket");

contract("CarbonMarket Suite", async accounts => {
  let tokenContract = null;
  let projectContract = null;
  let marketContract = null;
  const tokenURI = "https://test.com";
  const admin = accounts[0];
  const seller = accounts[1];
  const buyer = accounts[2];

  beforeEach(async () => {
    tokenContract = await CarbonToken.new();
    projectContract = await ProjectManagement.new(tokenContract.address);
    marketContract = await CarbonMarket.new(tokenContract.address);
  });

  describe("Deployment", async () => {
    it("should deploy all contracts", async () => {
      assert(tokenContract.address !== '');
      assert(projectContract.address !== '');
      assert(marketContract.address !== '');
    });
  });

  describe("Project Registration", async () => {
    const tokenSupply = 100;

    it("should register a new carbon credit project", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      const carbonCredit = await tokenContract.getCarbonCredit(1);
      // console.log(carbonCredit);

      assert.equal(Number(carbonCredit.tokenId), 1, "Token ID is not correct");
      assert.equal(carbonCredit.initialOwner, seller, "Owner is not correct");
      assert.equal(Number(carbonCredit.status), 0, "Status is not correct");
      assert.equal(Number(carbonCredit.pricePerCredit), 0, "Price per credit is not correct");
      assert.equal(carbonCredit.isListed, false, "Is listed is not correct");
    });

    it("should mint tokens correctly", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      const initialBalance = await tokenContract.balanceOf(seller, 1);
      assert.equal(initialBalance.toNumber(), tokenSupply, "The initial balance is not correct");
    });

    it("first token should point to the correct URI", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      const uri = await tokenContract.uri(1);
      assert.equal(uri, tokenURI, "The URI of the token does not match the expected value");
    }
    );
  });

  describe("Project Approval", async () => {
    const tokenSupply = 100;

    it("should approve a carbon credit project", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      const carbonCredit = await tokenContract.getCarbonCredit(1);
      // console.log(carbonCredit);

      assert.equal(Number(carbonCredit.status), 1, "Status is not correct");
    });

    it("should only allow the owner to approve a project", async () => {
      await projectContract.registerProject(tokenSupply, { from: accounts[1] });

      try {
        await projectContract.approveProject(1, { from: accounts[1] });
        assert.fail("The transaction should have failed but didn't");
      } catch (error) {
        assert(error.message.includes("Ownable: caller is not the owner"), "Expected an error but got a different one");
      }
    });
  });


  describe("Project Declination", async () => {
    const tokenSupply = 100;

    it("should decline the project", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.declineProject(1);
      const credit = await tokenContract.getCarbonCredit(1);
      assert.equal(Number(credit.status), 2, "The project status does not match the expected value");
    });
  });

  describe("Listing Credits for Sale", async () => {
    const tokenSupply = 100;
    const salePrice = 10; // Define the sale price for the credit

    it("should list credits for sale", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await marketContract.listCreditsForSale(1, salePrice, { from: seller });
      const credit = await tokenContract.getCarbonCredit(1);

      assert.equal(credit.isListed, true, "The credit is not listed for sale.");
      assert.equal(Number(credit.pricePerCredit), salePrice, "The price per credit is not correct.");
    });
  });

  describe("Getting Credit By Index", async () => {
    const tokenSupply = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
    });

    it("should get one credit created", async () => {
      const totalSupply = await tokenContract.getTotalTokensCount();
      assert.equal(totalSupply, 1, "The total supply does not match the expected value");
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

  describe("Getting Listed Tokens Count", async () => {
    const tokenSupply = 100;

    it("should get the correct count of listed tokens", async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await marketContract.listCreditsForSale(1, 10, { from: seller });
      const count = await marketContract.getListedTokensCount();
      assert.equal(Number(count), 1, "The count of listed tokens does not match the expected value");
    });
  });

  describe("Buying Credits", async () => {
    const tokenSupply = 100;
    const salePrice = web3.utils.toWei("0.001", "ether");
    const buyAmount = 50;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await marketContract.listCreditsForSale(1, salePrice, { from: seller });
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
        assert(error.message.includes("Insufficient balance to purchase."), "Expected an error but got a different one");
      }
    });

    it("should not allow a user to buy credits without enough funds", async () => {
      try {
        await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount - web3.utils.toWei("0.0001", "ether") });
        assert.fail("The transaction should have failed but didn't");
      } catch (error) {
        assert(error.message.includes("Insufficient funds to purchase."), "Expected an error but got a different one");
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
    
      // Perform the purchase transaction
      const receipt = await marketContract.buyCredits(1, buyAmount, { from: buyer, value: transactionValue });
    
      const finalSellerEthBalance = web3.utils.toBN(await web3.eth.getBalance(seller));
    
      // Calculate expected balance after the transaction
      const expectedSellerBalance = initialSellerEthBalance.add(transactionValue);
    
      assert.equal(finalSellerEthBalance.toString(), expectedSellerBalance.toString(), "Ether not correctly transferred to the seller.");
    });
    
  });


  describe("Getting Credit By Index", async () => {
    const tokenSupply = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
    });

    it("should get one credit created", async () => {
      const totalSupply = await tokenContract.getTotalTokensCount();
      assert.equal(totalSupply, 1, "The total supply does not match the expected value");
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
    const salePrice = web3.utils.toWei("0.001", "ether");

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await marketContract.listCreditsForSale(1, salePrice, { from: seller });

      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.declineProject(2, { from: admin });

      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(3, { from: admin });
      // await _contract.listCreditsForSale(3, salePrice);
    });

    it("should get all listed credits", async () => {
      const listedCredits = await marketContract.getAllListedCredits();
      assert.equal(listedCredits.length, 1, "The number of listed credits does not match the expected value");

      for (let i = 0; i < listedCredits.length; i++) {
        // console.log(listedCredits[i]);
        assert.equal(listedCredits[i].isListed, true, "The isListed value of a listed credit is not correct");
      }
    });
  });

  describe("Getting Owned Credits", async () => {
    const tokenSupply = 100;
    const buyAmount = 10;
    const salePrice = web3.utils.toWei("0.001", "ether");

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await marketContract.listCreditsForSale(1, salePrice, { from: seller });

      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(2, { from: admin });
      await marketContract.listCreditsForSale(2, salePrice, { from: seller });

      // Buyer purchases some credits
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });
      await marketContract.buyCredits(2, buyAmount, { from: buyer, value: salePrice * buyAmount });
    });

    it("should get the correct owned credits for the buyer", async () => {
      const ownedCredits = await tokenContract.getOwnedCredits({ from: buyer });

      assert.equal(ownedCredits.length, 2, "Buyer should own credits from 2 project");

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

  describe("Retiring Credits", async () => {
    const tokenSupply = 100;
    const salePrice = web3.utils.toWei("0.001", "ether");

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });

      // await _contract.registerProject(tokenSupply, { from: accounts[1] });
      // await _contract.approveProject(2, { from: accounts[0] });
    });

    it("should allow a user to retire their credits if they have sufficient balance", async () => {
      const retireAmount = 50;
      const balanceBefore = await tokenContract.balanceOf(seller, 1);

      await marketContract.retireCredits(1, retireAmount, { from: seller });

      const balanceAfter = await tokenContract.balanceOf(seller, 1);
      assert.equal(balanceAfter.toNumber(), tokenSupply - retireAmount, "The tokens were not retired correctly.");
    });

    it("should fail to retire credits if the user does not have enough tokens", async () => {
      const retireAmount = 150; // More than the supply

      try {
        // Attempt to retire more tokens than available for the second project
        await marketContract.retireCredits(2, retireAmount, { from: seller });
        assert.fail("The transaction should have failed but didn't.");
      } catch (error) {
        assert.include(error.message, "Insufficient token balance to retire", "Expected token balance error but got another error.");
      }
    });

    it("should not allow a user to retire tokens they do not own", async () => {
      const retireAmount = 10;

      // Assuming no tokens of this type have been minted to accounts[2]
      try {
        await marketContract.retireCredits(2, retireAmount, { from: buyer });
        assert.fail("The transaction should have failed but didn't.");
      } catch (error) {
        assert.include(error.message, "Insufficient token balance to retire", "Expected token balance error but got another error.");
      }
    });

    it("should allow buyer to retire their credits", async () => {
      const retireAmount = 10;
      await marketContract.listCreditsForSale(1, salePrice, { from: seller });
      await marketContract.buyCredits(1, retireAmount, { from: buyer, value: salePrice * retireAmount });
      const balanceBefore = await tokenContract.balanceOf(buyer, 1);

      await tokenContract.setApprovalForAll(marketContract.address, true, { from: buyer });
      await marketContract.retireCredits(1, retireAmount, { from: buyer });

      const balanceAfter = await tokenContract.balanceOf(buyer, 1);
      assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() - retireAmount, "The tokens were not retired correctly.");
    });
  });

  describe("All Tokens Enumeration Removal", async () => {
    const tokenSupply = 100;
    const retireAmount = 100;

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });

    });

    it("should remove the token from all tokens enumeration when all units are burned", async () => {
      await marketContract.retireCredits(1, retireAmount, { from: seller });  // retire all credits

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
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(tokenId, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });

    });

    it("should return the correct initial token supply", async () => {
      const supply = await tokenContract.getTokenSupply(tokenId);
      assert.equal(supply.toNumber(), tokenSupply, "The initial token supply is incorrect.");
    });

    it("should decrease the token supply after burning tokens", async () => {
      await marketContract.retireCredits(tokenId, burnAmount, { from: seller });
      const supplyAfterBurn = await tokenContract.getTokenSupply(tokenId);
      assert.equal(supplyAfterBurn.toNumber(), tokenSupply - burnAmount, "The token supply did not decrease correctly after burning tokens.");
    });

    it("should not allow burning more tokens than the owner possesses", async () => {
      try {
        await marketContract.retireCredits(tokenId, tokenSupply + 1, { from: seller });
        assert.fail("The transaction should have failed but didn't.");
      } catch (error) {
        assert.include(error.message, "Insufficient token balance to retire", "Expected token balance error but got another error.");
      }
    });
  });

  describe("Token Ownership Tracking", async () => {
    const tokenSupply = 100;
    const buyAmount = 10;
    const salePrice = web3.utils.toWei("0.001", "ether");

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
    });

    it("should track new owner upon minting", async () => {
      let owners = await tokenContract.getTokenOwners(1);
      assert.equal(owners.includes(seller), true, "Account 0 should be listed as an owner after project approval");
      assert.equal(await tokenContract.getOwnerCount(1), 1, "Owner count should be exactly 1");
    });

    it("should add a new owner upon transfer", async () => {
      await marketContract.listCreditsForSale(1, salePrice, { from: seller });
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });
      let owners = await tokenContract.getTokenOwners(1);
      assert.equal(owners.includes(buyer), true, "Account 1 should be listed as an owner after transfer");
      assert.equal(await tokenContract.getOwnerCount(1), 2, "Owner count should be 2");
    });

    it("should remove owner when all their tokens are transferred", async () => {
      await marketContract.listCreditsForSale(1, salePrice, { from: seller });
      await marketContract.buyCredits(1, tokenSupply, { from: buyer, value: salePrice * tokenSupply });
      let owners = await tokenContract.getTokenOwners(1);
      // console.log(owners);
      assert.equal(owners.includes(seller), false, "Account 0 should no longer be listed as an owner after transferring all tokens");
      assert.equal(await tokenContract.getOwnerCount(1), 1, "Owner count should be 1 with account 1 as the sole owner");
    });

    it("should correctly handle ownership when tokens are burned", async () => {
      let initialOwnerCount = await tokenContract.getOwnerCount(1);
      assert.equal(initialOwnerCount, 1, "Initial owner count should be 1");

      await marketContract.retireCredits(1, tokenSupply, { from: seller });

      let finalOwnerCount = await tokenContract.getOwnerCount(1);
      assert.equal(finalOwnerCount, 0, "Owner count should return to 0 after burning all tokens");

      let owners = await tokenContract.getTokenOwners(1);
      assert.equal(owners.length, 0, "No owners should remain after all tokens are burned");
    });

  });

  describe("Token balance after buying", async () => {
    const tokenSupply = 100;
    const buyAmount = 10;
    const salePrice = web3.utils.toWei("0.001", "ether");

    beforeEach(async () => {
      await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
      await projectContract.approveProject(1, { from: admin });
      await tokenContract.setApprovalForAll(marketContract.address, true, { from: seller });
      await marketContract.listCreditsForSale(1, salePrice, { from: seller });
    });

    it("should return the correct balance of the buyer after buying", async () => {
      const initialBalance = await tokenContract.balanceOf(buyer, 1);
      await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });
      const finalBalance = await tokenContract.balanceOf(buyer, 1);
      assert.equal(finalBalance.toNumber(), initialBalance.toNumber() + buyAmount, "The balance of the buyer is not correct after buying");
    });
  }
  );
});
