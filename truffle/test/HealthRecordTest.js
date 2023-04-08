const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");
var assert = require("assert");
const BigNumber = require('bignumber.js'); // npm install bignumber.js
const oneEth = new BigNumber(1000000000000000000); // 1 eth

var HealthRecord = artifacts.require("../contracts/HealthRecord.sol");

contract("HealthRecord", function (accounts) {
    before(async () => {
        healthRecordInstance = await HealthRecord.deployed();
        await healthRecordInstance.activatePatientProfile({ from: accounts[0] });
        await healthRecordInstance.activateInsurerProfile({ from: accounts[2] });
        await healthRecordInstance.activateInsurerProfile({ from: accounts[3] });
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

    it("Patient purchases critical illness coverage from assigned insurer", async () => {
        const amountPaid = oneEth.dividedBy(100);
        const purchaseCICoverage = await healthRecordInstance.purchaseCICoverage(accounts[2], {from: accounts[0], value: amountPaid});
        truffleAssert.eventEmitted(purchaseCICoverage, "CICoveragePurchased");
        const patientIsInsuredCI = await healthRecordInstance.getPatientIsInsuredCI();
        assert.equal(patientIsInsuredCI, true, "Patient does not have critical illness coverage");
        const insurerCoversPatientCI = await healthRecordInstance.getInsurerCoversPatientCI(accounts[0], {from: accounts[2]});
        assert.equal(insurerCoversPatientCI, 1, "Insurer does not have patient under critical illness coverage");
    })

    //this test case is a little sus, time taken for test to run does not appear for this test case only
    it("Patient purchases critical illness coverage from unassigned insurer", async() => {
        const amountPaid = oneEth.dividedBy(100);
        const purchaseCICoverage = healthRecordInstance.purchaseCICoverage(accounts[3], {from: accounts[0], value: amountPaid});
        truffleAssert.reverts(purchaseCICoverage);
    })

    it("Patient submits critical illness claim", async() => {
        const submission = await healthRecordInstance.submitCriticalIllness(accounts[2], 0, {from: accounts[0]});
        truffleAssert.eventEmitted(submission, "CIClaimSubmitted");
        const submittedRecord = await healthRecordInstance.getRecordCI(accounts[0], {from: accounts[2]});
        assert.strictEqual(submittedRecord, "MockRecord1", "The submitted records for critical illness do not match");
    })

    it("Insurer validates patient's critical illness claim", async() => {
        const validation = await healthRecordInstance.validateCIClaim(accounts[0], {from: accounts[2]});
        truffleAssert.eventEmitted(validation, "CIClaimValidated");
        const isValidCI = await healthRecordInstance.getValidityCI(accounts[0], {from: accounts[2]});
        assert.strictEqual(isValidCI, true, "The validation for the submitted record did not work properly");
    })

    it("Insurer reimburses patient's criticall illness claim", async() => {
        const amountPaid = oneEth.dividedBy(50);
        const reimbursement = await healthRecordInstance.reimburseCIClaim(accounts[0], {from: accounts[2], value: amountPaid});
        truffleAssert.eventEmitted(reimbursement, "CIClaimReimbursed");
        const submittedRecord = await healthRecordInstance.getRecordCI(accounts[0], {from: accounts[2]});
        assert.strictEqual(submittedRecord, "", "The submitted record was not deleted");
        const isValidCI = await healthRecordInstance.getValidityCI(accounts[0], {from: accounts[2]});
        assert.strictEqual(isValidCI, false, "The submitted record was not deleted");
    })
})