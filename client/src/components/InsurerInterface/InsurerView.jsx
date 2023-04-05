import React from 'react'
import { useState } from "react";

function InsurerView() {

    const [patientAddress, setPatientAddress] = useState("");

    const handlePatientAddressChange = e => {
        setPatientAddress(e.target.value);
    };

    const validatePatientClaim = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (doctorAddress === "") {
            alert("Please enter a value to write.");
            return;
        }
        await contract.methods.validateCIClaim(patientAddress).send({ from: accounts[0] });
    }

    return (
        <div className='btns'>
            <div className="input-btn">
                <input
                    type="text"
                    placeholder="Patient Address"
                    value={patientAddress}
                    onChange={handlePatientAddressChange}
                />

                <button onClick={validatePatientClaim}>
                    Validate Patient CI Claim
                </button>
            </div>

        </div>
    )
}

export default InsurerView