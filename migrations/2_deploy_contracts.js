const HealthcareContract = artifacts.require("HealthcareContract");
const HealthRecord = artifacts.require("HealthRecord");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(HealthcareContract);
    deployer.deploy(HealthRecord);
}