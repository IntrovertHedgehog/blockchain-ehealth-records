import React from 'react'
import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function InsurerView() {

    const { state: { contract, accounts } } = useEth();
    const [patientAddress, setPatientAddress] = useState("");
    const [medicalHistoryCopy, setMedicalHistoryCopy] = useState("");
    const [isUpdated, setIsUpdated] = useState("Method not called yet");

    const handlePatientAddressChange = e => {
        setPatientAddress(e.target.value);
    };

    const validatePatientClaim = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (patientAddress === "") {
            alert("Please enter a value to write.");
            return;
        }
        await contract.methods.validateCIClaim(patientAddress).send({ from: accounts[0] });
    }

    const reimbursePatientClaim = async (e) => {
        if (e.target.tagName === "INPUT") {
            return;
        }
        if (patientAddress === "") {
            alert("Please enter a value to write.");
            return;
        }
        await contract.methods.reimburseCIClaim(patientAddress).send({ from: accounts[0] });
    }

    const activateInsurerProfile = async (e) => {
        console.log("activate Insurer Profile");
        await contract.methods.activateInsurerProfile().send({ from: accounts[0] });
    };

    const readCopyProfile = async () => {
        const retrievedMedicalHistoryCopy = await contract.methods.readCopyProfiles(accounts[0]).call({ from: accounts[0] });
        setMedicalHistoryCopy(retrievedMedicalHistoryCopy);
        console.log(retrievedMedicalHistoryCopy);
    };

    const copyRecordIsUpdated = async () => {
        const isUpdated = await contract.methods.copyRecordIsUpdated(patientAddress, accounts[0]).call({ from: accounts[0] });
        if (isUpdated) {
            setIsUpdated("Updated");
        } else {
            setIsUpdated("Not Updated");
        }
    }

    return (
        <div className='btns'>
            <div>
                <button onClick={activateInsurerProfile} style={{ marginLeft: 10 }}>
                    Activate Insurer Profile
                </button>
            </div>

            <div style={{ flexDirection: "column" }}>
                <p>Medical History Copy</p>
                {
                    medicalHistoryCopy ?
                        medicalHistoryCopy
                        : <p>No copy of medical records</p>
                }
            </div>

            <div style={{ flexDirection: "column" }}>
                <p>Check if Copy is Updated</p>
                {
                    isUpdated ?
                        isUpdated
                        : <p>error</p>
                }
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

                <button onClick={copyRecordIsUpdated}>
                    Check if Copy is Updated
                </button>
            </div>

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

            <div className="input-btn">
                <input
                    type="text"
                    placeholder="Patient Address"
                    value={patientAddress}
                    onChange={handlePatientAddressChange}
                />

                <button onClick={reimbursePatientClaim}>
                    Reimburse Patient CI Claim
                </button>
            </div>

        </div>
    )
}

export default InsurerView