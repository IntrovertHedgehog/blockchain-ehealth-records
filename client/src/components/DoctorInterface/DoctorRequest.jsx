import React from 'react'
import { useState } from "react";

function DoctorRequest() {

    const [patientAddress, setPatientAddress] = useState("");
    const [patientMedicalHistory, setPatientMedicalHistory] = useState("");

    const handleInputChange = e => {
        setPatientAddress(e.target.value);
    };

    const retrieveRecords = async (e) => {
        console.log("Retrieve Records");
    };

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

            <div className="input-btn">
                <input
                    type="text"
                    placeholder="Patient Address"
                    value={patientAddress}
                    onChange={handleInputChange}
                />

                <button onClick={retrieveRecords}>
                    Retrieve Records
                </button>

            </div>
        </div>
    )
}

export default DoctorRequest