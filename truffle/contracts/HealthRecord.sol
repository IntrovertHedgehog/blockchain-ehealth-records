pragma solidity ^0.8.0;

contract HealthRecord {
    struct PatientProfile {
        bool isCreated;
        string[] medicalHistory;
        mapping(address => bool) isDoctor;
        mapping(address => string) medicalHistoryDoctorView;
        mapping(address => bool) isInsurer;
        mapping(address => string) medicaHistoryInsurerView;
    }

    mapping(address => PatientProfile) patientProfiles;

    event PatientProfileCreated(address patient);
    event PatientProfileUpdatedByOwner(address patient);
    event PatientProfileDeleted(address patient);
    event PatientProfileUpdatedByDoctor(address patient, address doctor);
    event PatientProfileDoctorAssigned(address patien, address doctor);
    event PatientProfileInsurerAssigned(address patien, address insurer);

    modifier withReadPrivilege(address patientAddress) {
        PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            patientAddress == msg.sender ||
                profile.isDoctor[msg.sender] ||
                profile.isInsurer[msg.sender],
            "You need read privilege to access this function"
        );
        _;
    }

    modifier withUpdatePrivilege(address patientAddress) {
        PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            patientAddress == msg.sender || profile.isDoctor[msg.sender],
            "You need update privilege to access this function"
        );
        _;
    }

    modifier ownerOnly(address patientAddress) {
        require(
            patientAddress == msg.sender,
            "Only owner of this profile can access this function"
        );
        _;
    }

    function readProfile(
        address patientAddress
    ) public view withReadPrivilege(patientAddress) returns (string[] memory) {
        return patientProfiles[patientAddress].medicalHistory;
    }

    function updateProfile(
        address patientAddress,
        string calldata newRecord
    ) public withUpdatePrivilege(patientAddress) {
        patientProfiles[patientAddress].medicalHistory.push(newRecord);
    }
}
