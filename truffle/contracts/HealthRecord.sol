// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./KeyStore.sol";

contract HealthRecord {
    struct PatientProfile {
        bool patientIsActive;
        string[] medicalHistory; // patient's medical history
        // this variable structure helps patients to easily obtain list of doctors
        address[] doctors; // array to keep track of doctors assigned to the patient
        address[] insurers; // similar to doctors
        mapping(address => uint) doctorNumbers; // The index of this doctor's address in the array `doctors`
        mapping(address => uint) insurerNumbers; // similar to doctorNumbers
        mapping(address => string[]) medicalHistoryCopies; // doctor and insurer's copies of patient's medical history
        bool isInsuredCI; //checks if patient is insured for critical illness
    }

    //added insurer struct *
    struct InsurerProfile {
        bool insurerIsActive;
        mapping(address => bool) criticalIllness; // mapping to store patient's addresses that have critical illness coverage
        mapping(address => string) recordCI; // mapping to store patient's relevant record when submitting a claim for critial illness
        mapping(address => bool) validityCI; // mapping to store whether each patient's CI claim is valid

        // focus on CI for now, before expanding to disability
        // mapping(address => string) disability;
        // mapping(address => bool) validityDisability;
    }

    mapping(address => PatientProfile) patientProfiles; // mapping of address to patient profile struct
    mapping(address => InsurerProfile) insurerProfiles; // similar to patientProfiles

    KeyStore public keyStore;

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

    event InsurerProfileActivated(address insurer);
    event CICoveragePurchased(address patient, address insurer, uint amt);
    event CIClaimSubmitted(address patient, address insurer, uint recordID);
    event CIClaimValidated(address patient, address insurer);
    event CIClaimReimbursed(address patient, address insurer, uint amt);

    event Debug(uint somenumber);

    constructor(KeyStore ks) {
        keyStore = ks;
    }

    modifier patientIsActive(address patientAddress) {
        require(
            patientProfiles[patientAddress].patientIsActive,
            "This patient profile is not active."
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

    modifier insurerIsActive(address insurerAddress) {
        require(
            insurerProfiles[insurerAddress].insurerIsActive,
            "This insurer profile is not active."
        );
        _;
    }

    // ensures that patient is insured for critical illness with the correct insurance agent
    modifier isInsuredCI(address patientAddress, address insurerAddress) {
        PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            profile.isInsuredCI == true,
            "You need to be insured for critical illness to access this function"
        );
        InsurerProfile storage insurer = insurerProfiles[insurerAddress];
        require(
            insurer.criticalIllness[patientAddress],
            "You do not have critical illness coverage under this insurance agent"
        );
        _;
    }

    // instantiate patient
    function activatePatientProfile() public {
        PatientProfile storage profile = patientProfiles[msg.sender];
        profile.patientIsActive = true;
        if (profile.doctors.length == 0) {
            profile.doctors.push(address(0));
            profile.insurers.push(address(0));
        }
        emit PatientProfileActivated(msg.sender);
    }

    // instantiate insurer *
    function activateInsurerProfile() public {
        InsurerProfile storage insurerProfile = insurerProfiles[msg.sender];
        insurerProfile.insurerIsActive = true;
        emit InsurerProfileActivated(msg.sender);
    }

    function deactivatePatientProfile() public {
        patientProfiles[msg.sender].patientIsActive = false;
        emit PatientProfileDeactivated(msg.sender);
    }

    // view medical history
    function readProfile(
        address patientAddress,
        bool isOriginal //redundant???
    )
        public
        view
        patientIsActive(patientAddress)
        withReadPrivilege(patientAddress, msg.sender)
        returns (string[] memory)
    {
        if (isOriginal || patientAddress == msg.sender) {
            // view original medical history if patient calls the function
            return patientProfiles[patientAddress].medicalHistory;
        } else {
            // view copy of medical history if doctor or insurer
            return
                patientProfiles[patientAddress].medicalHistoryCopies[
                    msg.sender
                ];
        }
    }

    // patient, doctor or insurer can run this function to read copy of record that doctor or insurer has
    function readCopyProfiles(
        address accessor
    ) public view patientIsActive(msg.sender) returns (string[] memory) {
        return patientProfiles[msg.sender].medicalHistoryCopies[accessor];
    }

    // add new record to patient's record
    function updateOriginalRecord(
        address patientAddress,
        string calldata newRecord
    )
        public
        patientIsActive(patientAddress)
        withUpdatePrivilege(patientAddress)
    {
        patientProfiles[patientAddress].medicalHistory.push(newRecord);
        emit PatientProfileOriginalUpdated(patientAddress, msg.sender);
    }

    // add new record to doctor's or insurer's record, assume that the new record already exists or will exist in the patient's record
    function updateCopyRecord(
        address patientAddress,
        address readerAddress,
        string memory newRecord
    )
        public
        patientIsActive(patientAddress)
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
    ) public view patientIsActive(patientAddress) returns (uint) {
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

        return (originalLength - copyLength);
    }

    function assignDoctor(
        address doctorAddress
    ) public patientIsActive(msg.sender) {
        PatientProfile storage profile = patientProfiles[msg.sender];
        require(
            profile.doctorNumbers[doctorAddress] == 0,
            "This doctor has already been assigned"
        );
        profile.doctors.push(doctorAddress);
        profile.doctorNumbers[doctorAddress] = profile.doctors.length - 1;
        emit Debug(profile.doctorNumbers[doctorAddress]);
        emit PatientProfileDoctorAssigned(msg.sender, doctorAddress);
    }

    function assignInsurer(
        address insurerAddress
    ) public patientIsActive(msg.sender) {
        PatientProfile storage profile = patientProfiles[msg.sender];
        require(
            profile.insurerNumbers[insurerAddress] == 0,
            "This insurer has already been assigned"
        );
        profile.insurers.push(insurerAddress);
        profile.insurerNumbers[insurerAddress] = profile.insurers.length - 1;
        emit PatientProfileInsurerAssigned(msg.sender, insurerAddress);
    }

    function revokeDoctor(
        address doctorAddress
    ) public patientIsActive(msg.sender) {
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

    function revokeInsurer(
        address insurerAddress
    ) public patientIsActive(msg.sender) {
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

    function getDoctors()
        public
        view
        patientIsActive(msg.sender)
        returns (address[] memory)
    {
        return patientProfiles[msg.sender].doctors;
    }

    function getInsurers()
        public
        view
        patientIsActive(msg.sender)
        returns (address[] memory)
    {
        return patientProfiles[msg.sender].insurers;
    }

    // patient purchase critical illness coverage from insurance agent
    function purchaseCICoverage(
        address payable insurerAddress
    )
        public
        payable
        patientIsActive(msg.sender)
        insurerIsActive(insurerAddress)
    {
        PatientProfile storage profile = patientProfiles[msg.sender];
        require(
            profile.insurerNumbers[insurerAddress] != 0,
            "Cannot purchase coverage from an insurer not assigned to this patient"
        );
        require(
            msg.value > 0,
            "Cannot purchase coverage without providing ether"
        );
        InsurerProfile storage insurer = insurerProfiles[insurerAddress];
        insurer.criticalIllness[msg.sender] = true;
        insurerAddress.transfer(msg.value);
        profile.isInsuredCI = true;
        emit CICoveragePurchased(msg.sender, insurerAddress, msg.value);
    }

    // Used by patient to submit a CI claim to insurer, along with the medical record
    function submitCriticalIllness(
        address insurerAddress,
        uint recordIndex
    )
        public
        isInsuredCI(msg.sender, insurerAddress)
        patientIsActive(msg.sender)
        insurerIsActive(insurerAddress)
    {
        InsurerProfile storage insurer = insurerProfiles[insurerAddress];
        string memory relevantRecord = patientProfiles[msg.sender].medicalHistoryCopies[insurerAddress][recordIndex];
        insurer.recordCI[msg.sender] = relevantRecord;
        emit CIClaimSubmitted(msg.sender, insurerAddress, recordIndex);
    }

    // run by insurers to validate CI claims
    function validateCIClaim(
        address patientAddress
    )
        public
        isInsuredCI(patientAddress, msg.sender)
        patientIsActive(patientAddress)
        insurerIsActive(msg.sender)
    {
        InsurerProfile storage insurer = insurerProfiles[msg.sender];
        insurer.validityCI[patientAddress] = true;
        emit CIClaimValidated(patientAddress, msg.sender);
    }

    // Used by Insurers to reimburse Patients with valid CI claims, returns msg.value, do we want to add an attribute for bill in the records?
    function reimburseCIClaim(
        address payable patientAddress
    )
        public
        payable
        isInsuredCI(patientAddress, msg.sender)
        patientIsActive(patientAddress)
        insurerIsActive(msg.sender)
        returns (uint)
    {
        InsurerProfile storage insurer = insurerProfiles[msg.sender];
        // PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            insurer.validityCI[patientAddress],
            "Please validate the CI claim first."
        );
        require(
            msg.value > 0,
            "Cannot reimburse critical illness claim without providing ether"
        );
        patientAddress.transfer(msg.value);

        //reset related mappings
        // delete insurer.criticalIllness[patientAddress]; //should not delete? if delete then patient's isInsuredCI should be set to false also
        delete insurer.recordCI[patientAddress];
        delete insurer.validityCI[patientAddress];
        emit CIClaimReimbursed(patientAddress, msg.sender, msg.value);

        return msg.value;
    }

    function getPatientIsInsuredCI()
        public
        view
        patientIsActive(msg.sender)
        returns (bool)
    {
        return patientProfiles[msg.sender].isInsuredCI;
    }

    function getInsurerCoversPatientCI(
        address patientAddress
    ) public view insurerIsActive(msg.sender) returns (bool) {
        return insurerProfiles[msg.sender].criticalIllness[patientAddress];
    }

    function getRecordCI(
        address patientAddress
    ) public view insurerIsActive(msg.sender) returns (string memory) {
        PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            profile.insurerNumbers[msg.sender] != 0,
            "This patient is not assigned to the insurance agent"
        );
        InsurerProfile storage insurer = insurerProfiles[msg.sender];
        return insurer.recordCI[patientAddress];
    }

    function getValidityCI(
        address patientAddress,
        address insurerAddress
    ) public view insurerIsActive(insurerAddress) returns (bool) {
        PatientProfile storage profile = patientProfiles[patientAddress];
        require(
            profile.insurerNumbers[insurerAddress] != 0,
            "This patient is not assigned to the insurance agent"
        );
        InsurerProfile storage insurer = insurerProfiles[insurerAddress];
        return insurer.validityCI[patientAddress];
    }
}