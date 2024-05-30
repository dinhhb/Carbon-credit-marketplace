const CarbonToken = artifacts.require("CarbonToken");
const AccountManagement = artifacts.require("AccountManagement");
const CarbonMarket = artifacts.require("CarbonMarket");
const ProjectManagement = artifacts.require("ProjectManagement");

module.exports = async function (deployer) {
  await deployer.deploy(CarbonToken);
  const tokenContract = await CarbonToken.deployed();

  const accountContract = await deployer.deploy(AccountManagement, tokenContract.address);

  const marketContract = await deployer.deploy(CarbonMarket, tokenContract.address, accountContract.address);

  await accountContract.setAuthorizedContract(marketContract.address);

  const projectContract = await deployer.deploy(ProjectManagement, tokenContract.address, accountContract.address, marketContract.address);
};
