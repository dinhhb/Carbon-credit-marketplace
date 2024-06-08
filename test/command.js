const tokenContract = await CarbonToken.deployed();
const accountContract = await AccountManagement.deployed(tokenContract.address);
const marketContract = await CarbonMarket.deployed(tokenContract.address, accountContract.address);
const projectContract = await ProjectManagement.deployed(tokenContract.address, accountContract.address, marketContract.address);
const retireContract = await Retirement.deployed(marketContract.address);

const admin = accounts[0];
const auditor = accounts[3];
const seller = accounts[1];
const buyer = accounts[2];
const totalCredits = 100000;

await accountContract.registerAccount(seller, totalCredits, false, { from: admin });
await accountContract.registerAccount(auditor, 0, true, { from: admin });
await accountContract.registerAccount(buyer, 0, false, { from: admin });
