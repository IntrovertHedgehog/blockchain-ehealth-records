// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthRecord {
    struct PatientProfile {
        bool isActive;
        string[] medicalHistory;
        mapping(address => bool) isDoctor;
        mapping(address => bool) isInsurer;
        mapping(address => string[]) medicalHistoryCopies;
    }

    mapping(address => PatientProfile) patientProfiles;

    event PatientProfileActivated(address patient);
    event PatientProfileDeactivated(address patient);
    // event PatientProfileCreated(address patient);
    event PatientProfileRead(address patient, address reader);
    event PatientProfileCopyUpdated(address patient);
    event PatientProfileOriginalUpdated(address patient, address doctor);
    // event PatientProfileDeleted(address patient);
    event PatientProfileDoctorAssigned(address patient, address doctor);
    event PatientProfileInsurerAssigned(address patient, address insurer);
    event PatientProfileDoctorRevoked(address patient, address doctor);
    event PatientProfileInsurerRevoked(address patient, address insurer);

    modifier isActive(address patientAddress) {
        require(
            patientProfiles[patientAddress].isActive,
            "This profile is not active."
        );
        _;
    }
    modifier withReadPrivilege(address patientAddress, address readerAddress) {
        PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            patientAddress == readerAddress ||
                profile.isDoctor[readerAddress] ||
                profile.isInsurer[readerAddress],
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
        address patientAddress,
        bool isOriginal
    )
        public
        withReadPrivilege(patientAddress, msg.sender)
        returns (string[] memory)
    {
        emit PatientProfileRead(patientAddress, msg.sender);
        if (isOriginal || patientAddress == msg.sender) {
            return patientProfiles[patientAddress].medicalHistory;
        } else {
            return
                patientProfiles[patientAddress].medicalHistoryCopies[
                    msg.sender
                ];
        }
    }

    function activateProfile() public {
        patientProfiles[msg.sender].isActive = true;
        emit PatientProfileActivated(msg.sender);
    }

    function deactivateProfile() public {
        patientProfiles[msg.sender].isActive = false;
        emit PatientProfileDeactivated(msg.sender);
    }

    function updateOriginalRecord(
        address patientAddress,
        string calldata newRecord
    ) public isActive(patientAddress) withUpdatePrivilege(patientAddress) {
        patientProfiles[patientAddress].medicalHistory.push(newRecord);
        emit PatientProfileOriginalUpdated(patientAddress, msg.sender);
    }

    function updateCopyRecord(
        address patientAddress,
        address readerAddress,
        string calldata newRecord
    )
        public
        isActive(patientAddress)
        ownerOnly(patientAddress)
        withReadPrivilege(patientAddress, readerAddress)
    {
        patientProfiles[patientAddress]
            .medicalHistoryCopies[readerAddress]
            .push(newRecord);
        emit PatientProfileCopyUpdated(patientAddress);
    }

    function copyRecordIsUpdated(
        address patientAddress,
        address accessorAddress
    ) public view isActive(patientAddress) returns (bool) {
        require(
            patientProfiles[patientAddress].isDoctor[accessorAddress] ||
                patientProfiles[patientAddress].isInsurer[accessorAddress],
            "This person does not have any access right to this record"
        );

        uint originalLength = patientProfiles[patientAddress]
            .medicalHistory
            .length;
        uint copyLength = patientProfiles[patientAddress]
            .medicalHistoryCopies[accessorAddress]
            .length;

        require(
            originalLength >= copyLength,
            "Something went wrong! Copy record is longer than original record."
        );

        return (originalLength == copyLength);
    }

    function assignDoctor(address doctorAddress) public isActive(msg.sender) {
        patientProfiles[msg.sender].isDoctor[doctorAddress] = true;
        emit PatientProfileDoctorAssigned(msg.sender, doctorAddress);
    }

    function assignInsurer(address insurerAddress) public isActive(msg.sender) {
        patientProfiles[msg.sender].isInsurer[insurerAddress] = true;
        emit PatientProfileInsurerAssigned(msg.sender, insurerAddress);
    }

    function revokeDoctor(address doctorAddress) public isActive(msg.sender) {
        patientProfiles[msg.sender].isDoctor[doctorAddress] = false;
        delete patientProfiles[msg.sender].medicalHistoryCopies[doctorAddress];
        emit PatientProfileDoctorRevoked(msg.sender, doctorAddress);
    }

    function revokeInsurer(address insurerAddress) public isActive(msg.sender) {
        patientProfiles[msg.sender].isInsurer[insurerAddress] = false;
        delete patientProfiles[msg.sender].medicalHistoryCopies[insurerAddress];
        emit PatientProfileInsurerRevoked(msg.sender, insurerAddress);
    }
}
