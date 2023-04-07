const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");
var assert = require("assert");

var HealthRecord = artifacts.require("../contracts/HealthRecord.sol");

contract("HealthRecord", function (accounts) {
    before(async () => {
        healthRecordInstance = await HealthRecord.deployed();
        await healthRecordInstance.activatePatientProfile({ from: accounts[0] });
    });

    it("Read medical history of a new account", async () => {
        const medicalHistory = await healthRecordInstance.readProfile(accounts[0], true, {from : accounts[0]});
        assert.deepEqual(medicalHistory, [], "Medical history should be empty");
    })

    it("Add new record to own profile", async () => {
        const record1 = "MockRecord1";
        const addNewRecord = await healthRecordInstance.updateOriginalRecord(accounts[0], record1, {from : accounts[0]});
        truffleAssert.eventEmitted(addNewRecord, "PatientProfileOriginalUpdated");
        const medicalHistory = await healthRecordInstance.readProfile(accounts[0], true, {from : accounts[0]});
        assert.deepEqual(medicalHistory, [record1], "Medical history does not match");
    })

    it("Assign new doctor to profile", async () => {
        const assignDoctor = await healthRecordInstance.assignDoctor(accounts[1], {from : accounts[0]});
        truffleAssert.eventEmitted(assignDoctor, "PatientProfileDoctorAssigned");
        const doctorList = await healthRecordInstance.getDoctors({from : accounts[0]});
        const doctorIsListed = doctorList.includes(accounts[1]);
        assert.ok(doctorIsListed, "New doctor is not added to patient profile");
    })

    it("Update new record to doctor's copy", async () => {
        const record1Copy = "MockRecord1Copy";
        const addNewRecordCopyToDoctor = await healthRecordInstance.updateCopyRecord(accounts[0], accounts[1], record1Copy, {from : accounts[0]});
        truffleAssert.eventEmitted(addNewRecordCopyToDoctor, "PatientProfileCopyUpdated");
        const medicalHistoryDoctorCopy = await healthRecordInstance.readCopyProfiles(accounts[1], {from : accounts[0]});
        assert.deepEqual(medicalHistoryDoctorCopy, [record1Copy], "Medical history copy does not match");
    })

    it("Doctor read doctor's copy of the records", async () => {
        const record1Copy = "MockRecord1Copy";
        const medicalHistoryDoctorCopy = await healthRecordInstance.readProfile(accounts[0], false, {from : accounts[1]});
        assert.deepEqual(medicalHistoryDoctorCopy, [record1Copy], "Medical history copy does not match");
    })

    it("Doctor read original copy of the records", async () => {
        const record1 = "MockRecord1";
        const medicalHistory = await healthRecordInstance.readProfile(accounts[0], true, {from : accounts[1]});
        assert.deepEqual(medicalHistory, [record1], "Medical history copy does not match");
    })

    it("Add new record to patient profile", async () => {
        const record1 = "MockRecord1";
        const record2 = "MockRecord2";
        const addNewRecord = await healthRecordInstance.updateOriginalRecord(accounts[0], record2, {from : accounts[1]});
        truffleAssert.eventEmitted(addNewRecord, "PatientProfileOriginalUpdated");
        const medicalHistory = await healthRecordInstance.readProfile(accounts[0], true, {from : accounts[0]});
        assert.deepEqual(medicalHistory, [record1, record2], "Medical history does not match");

    })

    it("Assign new insurer to profile", async () => {
        const assignInsurer = await healthRecordInstance.assignInsurer(accounts[2], {from : accounts[0]});
        truffleAssert.eventEmitted(assignInsurer, "PatientProfileInsurerAssigned");
        const insurerList = await healthRecordInstance.getInsurers({from : accounts[0]});
        const insurerIsListed = insurerList.includes(accounts[2]);
        assert.ok(insurerIsListed, "New insurer is not added to patient profile");
    })

    it("Update new record to insurer's copy", async () => {
        const record1Copy = "MockRecord1CopyInsurer";
        const addNewRecordCopyToInsurer = await healthRecordInstance.updateCopyRecord(accounts[0], accounts[2], record1Copy, {from : accounts[0]});
        truffleAssert.eventEmitted(addNewRecordCopyToInsurer, "PatientProfileCopyUpdated");
        const medicalHistoryInsurerCopy = await healthRecordInstance.readCopyProfiles(accounts[2], {from : accounts[0]});
        assert.deepEqual(medicalHistoryInsurerCopy, [record1Copy], "Medical history copy does not match");
    })

    it("Insurer read insurer's copy of the records", async () => {
        const record1Copy = "MockRecord1CopyInsurer";
        const medicalHistoryInsurerCopy = await healthRecordInstance.readProfile(accounts[0], false, {from : accounts[2]});
        assert.deepEqual(medicalHistoryInsurerCopy, [record1Copy], "Medical history copy does not match");
    })

    it("Insurer read original copy of the records", async () => {
        const record1 = "MockRecord1";
        const record2 = "MockRecord2";
        const medicalHistory = await healthRecordInstance.readProfile(accounts[0], true, {from : accounts[2]});
        assert.deepEqual(medicalHistory, [record1, record2], "Medical history copy does not match");
    })
})