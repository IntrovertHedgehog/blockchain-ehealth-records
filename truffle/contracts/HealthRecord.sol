// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthRecord {
    struct PatientProfile {
        bool isActive;
        string[] medicalHistory; // patient's medical history
        mapping(address => uint) doctorNumbers; // doctor's address mapped to 0 or 1, 0 indicates that he is given access to patient's record, 1 indicates otherwise
        mapping(address => uint) insurerNumbers; // similar to doctorNumbers
        address[] doctors; // array to keep track of doctors assigned to the patient
        address[] insurers; // similar to doctors
        mapping(address => string[]) medicalHistoryCopies; // doctor and insurer's copies of patient's medical history
        bool isInsuredCI;
    }

    //added insurer struct *
    struct Insurer {
        mapping(address => string) criticalIllness;
        mapping(address => bool) validityCI; 

        mapping(address => string) diability;
        mapping(address => bool) validityDisability; 
    }

    mapping(address => PatientProfile) patientProfiles;
    mapping(address => Insurer) insurerProfiles; //new

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

    //add modifier for checking active insurer profile *

    // ensure that only doctors and insurers that have been given access can read the record
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

    // ensure that only doctors and insurers that have been given access can update the record
    modifier withUpdatePrivilege(address patientAddress) {
        PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            patientAddress == msg.sender ||
                profile.doctorNumbers[msg.sender] != 0,
            "You need update privilege to access this function"
        );
        _;
    }

    // ensure that only the person running the function is the owner (patient)
    modifier ownerOnly(address patientAddress) {
        require(
            patientAddress == msg.sender,
            "Only owner of this profile can access this function"
        );
        _;
    }

    // instantiate patient
    function activateProfile() public {
        PatientProfile storage profile = patientProfiles[msg.sender];
        profile.isActive = true;
        if (profile.doctors.length == 0) {
        profile.doctors.push(address(0));
        profile.insurers.push(address(0));
        }
        emit PatientProfileActivated(msg.sender);
    }

    // instantiate insurer *

    function deactivateProfile() public {
        patientProfiles[msg.sender].isActive = false;
        emit PatientProfileDeactivated(msg.sender);
    }

    // view medical history
    function readProfile(
        address patientAddress,
        bool isOriginal //redundant???
    )
        public
        view
        isActive(patientAddress)
        withReadPrivilege(patientAddress, msg.sender)
        returns (string[] memory)
    {
        if (isOriginal || patientAddress == msg.sender) { // view original medical history if patient calls the function
            return patientProfiles[patientAddress].medicalHistory;
        } else { // view copy of medical history if doctor or insurer
            return
                patientProfiles[patientAddress].medicalHistoryCopies[
                    msg.sender
                ];
        }
    }

    // patient, doctor or insurer can run this function to read copy of record that doctor or insurer has
    function readCopyProfiles(
        address accessor
    ) public view isActive(msg.sender) returns (string[] memory) {
        return patientProfiles[msg.sender].medicalHistoryCopies[accessor];
    }

    // add new record to patient's record
    function updateOriginalRecord(
        address patientAddress,
        string calldata newRecord
    ) public isActive(patientAddress) withUpdatePrivilege(patientAddress) {
        patientProfiles[patientAddress].medicalHistory.push(newRecord);
        emit PatientProfileOriginalUpdated(patientAddress, msg.sender);
    }

    // add new record to doctor's or insurer's record, assume that the new record already exists or will exist in the patient's record
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

    // checking that everything in doctor's or insurer's record is already in patient's record
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

    // function purchaseCICoverage(address payable insurer) public payable isActive(msg.sender) {
    //     //check if the insurer is assigned to patient
    //     require();
    //     insurer.transfer(msg.value);
    //     PatientProfile storage profile = patientProfiles[msg.sender];
    //     profile.isInsuredCI = true;
    // }

    // function submitCriticalIllness(address insurer, uint recordIndex) {
    //     string[] medicalrecords = readProfile(msg.sender, true);
    //     string record = medicalrecords[recordIndex];
    //     //update mapping for claim under insurer
    //     Insurer storage agent= InsurerProfiles[insurer];
    //     agent.criticalIllness[msg.sender] = record

    //     //update medicalhistorycopy with record 

    // }
    
    // function validateCIClaim(address patient) {
    //     //check that insurer is in charge of patient
    // }

    
}
