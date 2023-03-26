// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthRecord {
    struct PatientProfile {
        bool isActive;
        string[] medicalHistory;
        mapping(address => uint) doctorNumbers;
        mapping(address => uint) insurerNumbers;
        address[] doctors;
        address[] insurers;
        mapping(address => string[]) medicalHistoryCopies;
    }

    mapping(address => PatientProfile) patientProfiles;

    event PatientProfileActivated(address patient);
    event PatientProfileDeactivated(address patient);
    // event PatientProfileCreated(address patient);
    // event PatientProfileRead(address patient, address reader);
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
                profile.doctorNumbers[readerAddress] != 0 ||
                profile.insurerNumbers[readerAddress] != 0,
            "You need read privilege to access this function"
        );
        _;
    }

    modifier withUpdatePrivilege(address patientAddress) {
        PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            patientAddress == msg.sender ||
                profile.doctorNumbers[msg.sender] != 0,
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

    function activateProfile() public {
        PatientProfile storage profile = patientProfiles[msg.sender];
        profile.isActive = true;
        if (profile.doctors.length == 0) {
        profile.doctors.push(address(0));
        profile.insurers.push(address(0));
        }
        emit PatientProfileActivated(msg.sender);
    }

    function deactivateProfile() public {
        patientProfiles[msg.sender].isActive = false;
        emit PatientProfileDeactivated(msg.sender);
    }

    function readProfile(
        address patientAddress,
        bool isOriginal
    )
        public
        view
        isActive(patientAddress)
        withReadPrivilege(patientAddress, msg.sender)
        returns (string[] memory)
    {
        if (isOriginal || patientAddress == msg.sender) {
            return patientProfiles[patientAddress].medicalHistory;
        } else {
            return
                patientProfiles[patientAddress].medicalHistoryCopies[
                    msg.sender
                ];
        }
    }

    function readCopyProfiles(
        address accessor
    ) public view isActive(msg.sender) returns (string[] memory) {
        return patientProfiles[msg.sender].medicalHistoryCopies[accessor];
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
            patientProfiles[patientAddress].doctorNumbers[accessorAddress] !=
                0 ||
                patientProfiles[patientAddress].insurerNumbers[
                    accessorAddress
                ] !=
                0,
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
        PatientProfile storage profile = patientProfiles[msg.sender];
        require(
            profile.doctorNumbers[doctorAddress] == 0,
            "This doctor has already been assigned"
        );
        profile.doctors.push(doctorAddress);
        profile.doctorNumbers[doctorAddress] = profile.doctors.length - 1;
        emit PatientProfileDoctorAssigned(msg.sender, doctorAddress);
    }

    function assignInsurer(address insurerAddress) public isActive(msg.sender) {
        PatientProfile storage profile = patientProfiles[msg.sender];
        require(
            profile.insurerNumbers[insurerAddress] == 0,
            "This insurer has already been assigned"
        );
        profile.insurers.push(insurerAddress);
        profile.insurerNumbers[insurerAddress] = profile.insurers.length - 1;
        emit PatientProfileInsurerAssigned(msg.sender, insurerAddress);
    }

    function revokeDoctor(address doctorAddress) public isActive(msg.sender) {
        PatientProfile storage profile = patientProfiles[msg.sender];
        require(
            profile.doctorNumbers[doctorAddress] != 0,
            "This doctor has not been assigned"
        );
        delete profile.doctors[profile.doctorNumbers[doctorAddress]];
        profile.doctorNumbers[doctorAddress] = 0;
        delete profile.medicalHistoryCopies[doctorAddress];
        emit PatientProfileDoctorRevoked(msg.sender, doctorAddress);
    }

    function revokeInsurer(address insurerAddress) public isActive(msg.sender) {
        PatientProfile storage profile = patientProfiles[msg.sender];
        require(
            profile.insurerNumbers[insurerAddress] != 0,
            "This insurer has not been assigned"
        );
        delete profile.insurers[profile.insurerNumbers[insurerAddress]];
        profile.insurerNumbers[insurerAddress] = 0;
        delete profile.medicalHistoryCopies[insurerAddress];
        emit PatientProfileInsurerRevoked(msg.sender, insurerAddress);
    }

    function getDoctors() public view isActive(msg.sender) returns (address[] memory) {
        return patientProfiles[msg.sender].doctors;
    }

    function getInsurers() public view isActive(msg.sender) returns (address[] memory) {
        return patientProfiles[msg.sender].insurers;
    }
}
