pragma solidity ^0.8.0;

contract HealthcareContract {
    struct Patient {
        string name;
        uint age;
        string[] medicalHistory;
        mapping(address => bool) doctors; // map of doctors who have access
        mapping(address => bool) insurers; // map of insurers who have access
    }

    mapping(address => Patient) patients;

    event PatientCreated(address patient);
    event MedicalRecordAdded(address patient);
    event RecordAccessAssinged(address patient, address entity);
    event RecordAccessRevoked(address patient, address doctor);

    function addPatient(string memory name, uint age) public {
        Patient storage patient = patients[msg.sender];
        patient.name = name;
        patient.age = age;
        patient.medicalHistory = new string[](0);
        patient.doctors[msg.sender] = true; // automatically grant access to patient
        patient.insurers[msg.sender] = false; // automatically deny access to patient
        emit PatientCreated(msg.sender);
    }

    function addMedicalRecord(string memory medicalRecord) public {
        patients[msg.sender].medicalHistory.push(medicalRecord);
        emit MedicalRecordAdded(msg.sender);
    }

    function grantAccess(address entity, bool isDoctor) public {
        if (isDoctor) {
            patients[msg.sender].doctors[entity] = true;
        } else {
            patients[msg.sender].insurers[entity] = true;
        }
        emit RecordAccessAssinged(msg.sender, entity);
    }

    function revokeAccess(address entity, bool isDoctor) public {
        if (isDoctor) {
            patients[msg.sender].doctors[entity] = false;
        } else {
            patients[msg.sender].insurers[entity] = false;
        }
        emit RecordAccessRevoked(msg.sender, entity);
    }

    // function getPatient()
    //     public
    //     view
    //     returns (string memory, uint, string[] memory, bool, bool)
    // {
    //     Patient memory patient = patients[msg.sender];
    //     bool doctorAccess = patient.doctors[msg.sender];
    //     bool insurerAccess = patient.insurers[msg.sender];
    //     return (
    //         patient.name,
    //         patient.age,
    //         patient.medicalHistory,
    //         doctorAccess,
    //         insurerAccess
    //     );
    // }
}
