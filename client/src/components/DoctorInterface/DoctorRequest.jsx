import React from 'react'
import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function DoctorRequest() {
    const { state: { contract, accounts } } = useEth();
    const [patientAddress, setPatientAddress] = useState("");
    const [patientMedicalHistory, setPatientMedicalHistory] = useState([]);
    const [updateProfileCopyRecords, setUpdateProfileCopyRecords] = useState("");
    const [medicalHistoryCopy, setMedicalHistoryCopy] = useState("");

    const handlePatientAddressChange = e => {
        setPatientAddress(e.target.value);
    };

    const handleUpdateProfileCopyRecord = e => {
        setUpdateProfileCopyRecords(e.target.value);
    };

    const readCopyProfile = async () => {
        const retrievedMedicalHistoryCopy = await contract.methods.readCopyProfiles(patientAddress).call({ from: accounts[0] });
        setMedicalHistoryCopy(retrievedMedicalHistoryCopy);
        console.log(retrievedMedicalHistoryCopy);
    };

    const retrieveRecords = async () => {
        const retrievedPatientMedicalHistory = await contract.methods.readProfile(patientAddress, true).call({ from: accounts[0] });
        console.log(retrievedPatientMedicalHistory);
        setPatientMedicalHistory(retrievedPatientMedicalHistory);
    };

    const updateProfileCopy = async () => {
        await contract.methods.updateCopyRecord(patientAddress, accounts[0], updateProfileCopyRecords).send({ from: accounts[0] });
    }

    return (
        <div className='btns'>

            <div style={{ flexDirection: "column" }}>
                <p>Patient's Medical History</p>
                {
                    patientMedicalHistory ?
                        patientMedicalHistory
                        : <p>No medical records retrieved</p>
                }
            </div>

            <div style={{ flexDirection: "column" }}>
                <p>Medical History Copy</p>
                {
                    medicalHistoryCopy ?
                        medicalHistoryCopy
                        : <p>No copy of medical records</p>
                }
            </div>

            <div className="input-btn">
                <input
                    type="text"
                    placeholder="Patient Address"
                    value={patientAddress}
                    onChange={handlePatientAddressChange}
                />

                <button onClick={retrieveRecords}>
                    Retrieve Records
                </button>
            </div>

            <div className="input-btn">
                <input
                    type="text"
                    placeholder="Patient Address"
                    value={patientAddress}
                    onChange={handlePatientAddressChange}
                />

                <button onClick={readCopyProfile}>
                    Retrieve Copy of Records
                </button>
            </div>

            <div className="input-btn">
                <input
                    type="text"
                    placeholder="Patient Address"
                    value={patientAddress}
                    onChange={handlePatientAddressChange}
                />
                <input
                    type="text"
                    placeholder="New Record (Copy)"
                    value={updateProfileCopyRecords}
                    onChange={handleUpdateProfileCopyRecord}
                />
                <button onClick={updateProfileCopy}>
                    Update Profile (Copy)
                </button>
            </div>

        </div>
    )
}

export default DoctorRequest