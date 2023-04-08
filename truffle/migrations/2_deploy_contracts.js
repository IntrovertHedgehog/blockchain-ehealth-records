const KeyStore = artifacts.require("KeyStore");
const HealthRecord = artifacts.require("HealthRecord");

module.exports = function (deployer) {
  deployer
    .deploy(KeyStore)
    .then(() => deployer.deploy(HealthRecord, KeyStore.address));
};
