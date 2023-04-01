import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function ContractBtns() {
  const { state: { contract, accounts } } = useEth();
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medicalHistoryCopy, setMedicalHistoryCopy] = useState("");
  const [updateProfileRecords, setUpdateProfileRecords] = useState("");
  const [doctorAddress, setDoctorAddress] = useState("");
  const [patientAddress, setPatientAddress] = useState("");

  const handleUpdateProfileRecord = e => {
    setUpdateProfileRecords(e.target.value);
  };

  const handleDoctorAddressChange = e => {
    setDoctorAddress(e.target.value);
  };

  const readProfile = async (isCopy) => {
    if (!isCopy) {
      const retrievedMedicalHistory = await contract.methods.readProfile(accounts[0], true).call({ from: accounts[0] });
      setMedicalHistory(retrievedMedicalHistory);
      console.log(retrievedMedicalHistory);
    } else {
      const retrievedMedicalHistoryCopy = await contract.methods.readCopyProfiles(accounts[0]).call({ from: accounts[0] });
      setMedicalHistoryCopy(retrievedMedicalHistoryCopy);
      console.log(retrievedMedicalHistoryCopy);
    }
  };

  const updateProfile = async () => {
    console.log(updateProfileRecords);
    await contract.methods.updateOriginalRecord(accounts[0], updateProfileRecords).send({ from: accounts[0] });
  }

  const assignDoctor = async e => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (doctorAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods.assignDoctor(doctorAddress).send({ from: accounts[0] });
  }

  const activateProfile = async (e) => {
    console.log("activate Profile");
    await contract.methods.activateProfile().send({ from: accounts[0] });
  };

  const deactivateProfile = async (e) => {
    console.log("deactivate Profile");
    await contract.methods.deactivateProfile().send({ from: accounts[0] });
  };

  return (
    <div className="btns">
      <div>
        <button onClick={readProfile(false)} style={{ marginRight: 10 }}>
          Read My Profile
        </button>

        <button onClick={readProfile(true)} style={{ marginRight: 10 }}>
          Read My Profile Copies
        </button>

        <button onClick={activateProfile} style={{ marginLeft: 10 }}>
          Activate Profile
        </button>

        <button onClick={deactivateProfile} style={{ marginLeft: 10 }}>
          Deactivate Profile
        </button>

      </div>

      <div style={{ flexDirection: "column" }}>
        <p>Medical History</p>
        {
          medicalHistory ?
            medicalHistory
            : <p>No medical records</p>
        }
      </div>

      <div style={{ flexDirection: "column" }}>
        <p>Medical History Copy</p>
        {
          medicalHistoryCopy ?
            medicalHistoryCopy
            : <p>No medical records</p>
        }
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="New Record"
          value={updateProfileRecords}
          onChange={handleUpdateProfileRecord}
        />
        <button onClick={updateProfile}>
          Update Profile
        </button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Doctor's Address"
          value={doctorAddress}
          onChange={handleDoctorAddressChange}
        />
        <button onClick={assignDoctor}>
          Assign Doctor
        </button>
      </div>

    </div >
  );
}

export default ContractBtns;
