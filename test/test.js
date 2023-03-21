const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");
var assert = require("assert");

var HealthcareContract = artifacts.require("../contracts/HealthcareContract.sol");

contract("HealthcareContract", function(accounts) {
    before(async() => {
        hcInstance = await HealthcareContract.deployed()
    });
    console.log("Testing HealthcareContract");

    it("Test 1: Adding Patient", async() => {
        await hcInstance.addPatient("John", 21); //patient's address is accounts[0]
        let result = await hcInstance.getPatient(0);
        let name = result[0];
        let age = result[1].toNumber();
        let record = result[2];
        assert.strictEqual(name, "John", "addPatient (name) is not working properly");
        assert.strictEqual(age, 21, "addPatient (age) is not working properly");
        assert.deepEqual(record, [], "addPatient (record) is not working properly");
    });

    it("Test 2: Adding Medical Record", async() => {
        await hcInstance.addMedicalRecord(0, "foo");
        let result = await hcInstance.getPatient(0);
        let record = result[2];
        assert.deepEqual(record, ["foo"], "addMedicalRecord is not working properly");
    });

    it("Test 3: Granting Access to Doctor", async() => { //subject to changes because if IsDoctor is false, this means that patients can be added to insurers
        await hcInstance.grantAccess(0, accounts[1], true);
        let bool = await hcInstance.checkAllowedDoctor(0, accounts[1]);
        assert.strictEqual(bool, true, "grantAccess is not working properly");
    });

    it("Test 4: Revoking Access from Doctor", async() => {
        await hcInstance.revokeAccess(0, accounts[1], true);
        let bool = await hcInstance.checkAllowedDoctor(0, accounts[1]);
        assert.strictEqual(bool, false, "revokeAccess is not working properly");
    });
})