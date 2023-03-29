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
    const retrievedMedicalHistory = await contract.methods.readProfile(accounts[0]).call({ from: accounts[0] });
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
    await contract.methods.updateProfile(accounts[0], newRecord).send({ from: accounts[0] });
  };

  const toggleProfile = async (e) => {
    console.log("Toggle Profile");
  };

  return (
    <div className="btns">
      <div>
        <button onClick={readProfile} style={{ marginRight: 10 }}>
          Read My Profile
        </button>

        <button onClick={toggleProfile} style={{ marginLeft: 10 }}>
          Activate / Deactivate Profile
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
