// const tokenContract = await CarbonToken.deployed();
// const projectContract = await ProjectManagement.deployed(tokenContract.address);
// const marketContract = await CarbonMarket.deployed(tokenContract.address);

// await projectContract.registerProject(100, {from: accounts[0]});
// await projectContract.approveProject(1, { from: accounts[0] });
// const salePrice = web3.utils.toWei('1', 'ether');
// await tokenContract.setApprovalForAll(marketContract.address, true);
// await marketContract.listCreditsForSale(1, salePrice, {from: accounts[0]});

// await marketContract.buyCredits(1, 10, { from: accounts[1], value: salePrice * 10 });

// await projectContract.registerProject(200);
// await projectContract.approveProject(2, { from: accounts[0] });
