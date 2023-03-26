pragma solidity ^0.8.0;

contract HealthcareContract {
    struct Patient {
        address patientAddress;
        string name;
        uint age;
        string[] medicalHistory;
        mapping(address => bool) doctors; // map of doctors who have access
        mapping(address => bool) insurers; // map of insurers who have access
    }

    uint128 nextId;
    mapping(uint128 => Patient) patients;

    event PatientCreated(address patient);
    event MedicalRecordAdded(address patient);
    event RecordAccessAssigned(address patient, address entity);
    event RecordAccessRevoked(address patient, address doctor);

    constructor() {
        nextId = 0;
    }

    modifier allowedDoctor(uint128 patientId) {
        require(
            patients[patientId].doctors[msg.sender] == true,
            "Only allowed doctors can access this function"
        );
        _;
    }

    modifier allowedInsurer(uint128 patientId) {
        require(
            patients[patientId].insurers[msg.sender] == true,
            "Only allowed insurers can access this function"
        );
        _;
    }

    modifier allowedInsurerOrDoctor(uint128 patientId) {
        require(
            patients[patientId].insurers[msg.sender] == true || patients[patientId].doctors[msg.sender] == true,
            "Only allowed insurers or doctors can access this function"
        );
        _;
    }

    modifier patientOnly(uint128 patientId) {
        require(
            patients[patientId].patientAddress == msg.sender,
            "Only patient can access this function"
        );
        _;
    }

    function addPatient(string memory name, uint age) public {
        Patient storage patient = patients[nextId];
        patient.patientAddress = msg.sender;
        patient.name = name;
        patient.age = age;
        patient.medicalHistory = new string[](0);
        patient.doctors[msg.sender] = true; // automatically grant access to patient
        patient.insurers[msg.sender] = false; // automatically deny access to patient
        nextId++;
        emit PatientCreated(msg.sender);
    }

    function addMedicalRecord(uint128 patientId, string memory medicalRecord) public allowedDoctor(patientId) {
        patients[patientId].medicalHistory.push(medicalRecord);
        emit MedicalRecordAdded(msg.sender);
    }

    function grantAccess(uint128 patientId, address entity, bool isDoctor) public patientOnly(patientId) {
        if (isDoctor) {
            patients[patientId].doctors[entity] = true;
        } else {
            patients[patientId].insurers[entity] = true;
        }
        emit RecordAccessAssigned(msg.sender, entity);
    }

    function revokeAccess(uint128 patientId, address entity, bool isDoctor) public patientOnly(patientId) {
        if (isDoctor) {
            patients[patientId].doctors[entity] = false;
        } else {
            patients[patientId].insurers[entity] = false;
        }
        emit RecordAccessRevoked(msg.sender, entity);
    }

    function getPatient(uint128 patientId)
        public
        view
        allowedInsurerOrDoctor(patientId)
        returns (string memory, uint, string[] memory)
    {
        Patient storage patient = patients[patientId];
        return (
            patient.name,
            patient.age,
            patient.medicalHistory
        );
    }

    function checkAllowedDoctor(uint128 patientId, address doctor) public view returns (bool) {
        return patients[patientId].doctors[doctor];
    }
}
