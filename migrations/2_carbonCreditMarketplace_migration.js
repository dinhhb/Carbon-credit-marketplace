const CarbonCreditMarketplace = artifacts.require("CarbonCreditMarketplace");

module.exports = function (deployer) {
  deployer.deploy(CarbonCreditMarketplace);
};