const HealthcareContract = artifacts.require("HealthcareContract");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(HealthcareContract);
}