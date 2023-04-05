import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function ContractBtns() {
  const { state: { contract, accounts } } = useEth();
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medicalHistoryCopy, setMedicalHistoryCopy] = useState("");
  const [updateProfileRecords, setUpdateProfileRecords] = useState("");
  const [doctorList, setDoctorList] = useState([]);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [insurerAddress, setInsurerAddress] = useState("");

  const handleUpdateProfileRecord = e => {
    setUpdateProfileRecords(e.target.value);
  };

  const handleDoctorAddressChange = e => {
    setDoctorAddress(e.target.value);
  };

  const handleInsurerAddressChange = e => {
    setInsurerAddress(e.target.value);
  };

  const readProfile = async () => {
    const retrievedMedicalHistory = await contract.methods.readProfile(accounts[0], true).call({ from: accounts[0] });
    setMedicalHistory(retrievedMedicalHistory);
    console.log(retrievedMedicalHistory);
  };

  const readCopyProfile = async () => {
    const retrievedMedicalHistoryCopy = await contract.methods.readCopyProfiles(accounts[0]).call({ from: accounts[0] });
    setMedicalHistoryCopy(retrievedMedicalHistoryCopy);
    console.log(retrievedMedicalHistoryCopy);
  };

  const updateProfile = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (updateProfileRecords === "") {
      alert("Please enter a value to write.");
      return;
    }
    console.log(accounts[0]);
    console.log(updateProfileRecords);
    await contract.methods.updateOriginalRecord(accounts[0], updateProfileRecords).send({ from: accounts[0] });
  };

  const assignDoctor = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (doctorAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods.assignDoctor(doctorAddress).send({ from: accounts[0] });
  }

  const revokeDoctor = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (doctorAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods.revokeDoctor(doctorAddress).send({ from: accounts[0] });
  }

  const assignInsurer = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (insurerAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods.assignInsurer(insurerAddress).send({ from: accounts[0] });
  }

  const revokeInsurer = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (insurerAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods.revokeInsurer(insurerAddress).send({ from: accounts[0] });
  }

  const activateProfile = async (e) => {
    console.log("activate Profile");
    await contract.methods.activatePatientProfile().send({ from: accounts[0] });
  };

  const deactivateProfile = async (e) => {
    console.log("deactivate Profile");
    await contract.methods.deactivatePatientProfile().send({ from: accounts[0] });
  };

  const getDoctors = async (e) => {
    console.log("get doctors");
    const doctorList = await contract.methods.getDoctors().call({ from: accounts[0] });
    setDoctorList(doctorList);
    // console.log(doctorList)
  }

  return (
    <div className="btns">
      <div>
        <button onClick={readProfile} style={{ marginRight: 10 }}>
          Read My Profile
        </button>

        <button onClick={readCopyProfile} style={{ marginRight: 10 }}>
          Read My Profile Copies
        </button>

        <button onClick={activateProfile} style={{ marginLeft: 10 }}>
          Activate Profile
        </button>

        <button onClick={deactivateProfile} style={{ marginLeft: 10 }}>
          Deactivate Profile
        </button>

        <button onClick={getDoctors} style={{ marginLeft: 10 }}>
          Get My Doctors
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
            : <p>No copy of medical records</p>
        }
      </div>

      <div style={{ flexDirection: "column" }}>
        <p>List of My Doctors</p>
        {
          doctorList ?
            doctorList
            : <p>No doctors retrieved</p>
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
      <div className="input-btn">
        <input
          type="text"
          placeholder="Doctor's Address"
          value={doctorAddress}
          onChange={handleDoctorAddressChange}
        />
        <button onClick={revokeDoctor}>
          Revoke Doctor
        </button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Insurer's Address"
          value={insurerAddress}
          onChange={handleInsurerAddressChange}
        />
        <button onClick={assignInsurer}>
          Assign Insurer
        </button>
      </div>
      <div className="input-btn">
        <input
          type="text"
          placeholder="Insurer's Address"
          value={insurerAddress}
          onChange={handleInsurerAddressChange}
        />
        <button onClick={revokeInsurer}>
          Revoke Insurer
        </button>
      </div>

    </div >
  );
}

export default ContractBtns;
