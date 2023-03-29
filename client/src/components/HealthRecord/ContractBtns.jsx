import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function ContractBtns() {
  const { state: { contract, accounts } } = useEth();
  const [medicalHistory, setMedicalHistory] = useState("");
  const [newRecord, setNewRecord] = useState("");

  const handleInputChange = e => {
    setNewRecord(e.target.value);
  };

  const readProfile = async () => {
    const retrievedMedicalHistory = await contract.methods.readProfile(accounts[0], true).call({ from: accounts[0] });
    setMedicalHistory(retrievedMedicalHistory);
    console.log(retrievedMedicalHistory);
  };

  const updateProfile = async e => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (newRecord === "") {
      alert("Please enter a value to write.");
      return;
    }
    console.log(accounts[0]);
    console.log(newRecord);
    await contract.methods.updateProfile(accounts[0], newRecord).send({ from: accounts[0] });
  };

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
        <button onClick={readProfile} style={{ marginRight: 10 }}>
          Read My Profile
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

      <div className="input-btn">
        <input
          type="text"
          placeholder="New Record"
          value={newRecord}
          onChange={handleInputChange}
        />

        <button onClick={updateProfile}>
          Update Profile
        </button>

      </div>

    </div >
  );
}

export default ContractBtns;
