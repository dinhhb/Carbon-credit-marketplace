const CarbonToken = artifacts.require("CarbonToken");
const ProjectManagement = artifacts.require("ProjectManagement");
const CarbonMarket = artifacts.require("CarbonMarket");

module.exports = async function (deployer) {
  await deployer.deploy(CarbonToken);
  const tokenContract = await CarbonToken.deployed();

  await deployer.deploy(ProjectManagement, tokenContract.address);

  await deployer.deploy(CarbonMarket, tokenContract.address);
};
