// const tokenContract = await CarbonToken.deployed();
// const projectContract = await ProjectManagement.deployed(tokenContract.address);
// const marketContract = await CarbonMarket.deployed(tokenContract.address);


// const tokenSupply = 100;
// const buyAmount = 10;
// const seller = accounts[1];
// const buyer = accounts[2];
// const salePrice = web3.utils.toWei("0.001", "ether");
// const tokenURI = "https://ipfs.io/ipfs/QmZ";

// await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
// await projectContract.approveProject(1, { from: accounts[0] });
// await tokenContract.setApprovalForAll(marketContract.address, true, { form: seller });
// await marketContract.listCreditsForSale(1, salePrice, { from: seller });

// await projectContract.registerProject(tokenSupply, tokenURI, { from: seller });
// await projectContract.approveProject(2, { from: accounts[0] });
// await marketContract.listCreditsForSale(2, salePrice, { from: seller });

// // Buyer purchases some credits
// await marketContract.buyCredits(1, buyAmount, { from: buyer, value: salePrice * buyAmount });
// await marketContract.buyCredits(2, buyAmount, { from: buyer, value: salePrice * buyAmount });

// const ownedCredits = await tokenContract.getOwnedCredits({ from: buyer });
// console.log(ownedCredits);

