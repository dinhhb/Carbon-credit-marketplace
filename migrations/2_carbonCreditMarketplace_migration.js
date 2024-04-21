const CarbonMarket = artifacts.require("CarbonMarket");

module.exports = function (deployer) {
  deployer.deploy(CarbonMarket);
};