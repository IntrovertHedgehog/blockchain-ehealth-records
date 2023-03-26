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

  return (
    <div className="btns">

      <button onClick={readProfile}>
        readProfile()
      </button>

      <p>
        {medicalHistory ? medicalHistory : null}
      </p>

      <div onClick={updateProfile} className="input-btn">
        write(<input
          type="text"
          placeholder="uint"
          value={newRecord}
          onChange={handleInputChange}
        />)
      </div>

    </div>
  );
}

export default ContractBtns;
