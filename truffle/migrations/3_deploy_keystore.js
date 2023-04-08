const KeyStore = artifacts.require("KeyStore");

module.exports = function(deployer) {
  deployer.deploy(KeyStore);
}