import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { getRecord, postRecord } from "../../services/records";
import { newKeyPair } from "../../services/cryptography";

const blankAddress = `0x${"0".repeat(40)}`;

function ContractBtns() {
  const {
    state: { contract, accounts },
  } = useEth();
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medicalHistoryCopy, setMedicalHistoryCopy] = useState("");
  const [updateProfileRecords, setUpdateProfileRecords] = useState("");
  const [updateProfileCopyRecords, setUpdateProfileCopyRecords] = useState("");
  const [doctorList, setDoctorList] = useState([]);
  const [insurerList, setInsurerList] = useState([]);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [insurerAddress, setInsurerAddress] = useState("");
  const [readerAddress, setReaderAddress] = useState("");
  const [passphrase, setPassphrase] = useState("");
  let keyPair = {
    publicKey: '',
    privateKey: '',
  }

  const handleUpdateProfileRecord = (e) => {
    setUpdateProfileRecords(e.target.value);
  };

  const handleDoctorAddressChange = (e) => {
    setDoctorAddress(e.target.value);
  };

  const handleInsurerAddressChange = (e) => {
    setInsurerAddress(e.target.value);
  };

  const handleReaderAddressChange = (e) => {
    setReaderAddress(e.target.value);
  };

  const handleUpdateProfileCopyRecord = (e) => {
    setUpdateProfileCopyRecords(e.target.value);
  };

  const setNewKeyPair = async () => {
    keyPair = newKeyPair(passphrase);
    console.log(keyPair);
  };

  const retrieveKeyPair = async() => {

  }

  const readProfile = async () => {
    const retrievedMedicalHistory = await contract.methods
      .readProfile(accounts[0], true)
      .call({ from: accounts[0] });
    const recordHistory = (
      await Promise.all(
        retrievedMedicalHistory
          .filter((r) => r)
          .map(async (r) => await getRecord(r))
      )
    )
      .filter((r) => r)
      .map((r) => JSON.stringify(r, null, 3))
      .map((r) => (
        <div>
          <pre>{r}</pre>
        </div>
      ));
    setMedicalHistory(recordHistory);
    console.log(retrievedMedicalHistory);
  };

  const readCopyProfile = async () => {
    const retrievedMedicalHistoryCopy = await contract.methods
      .readCopyProfiles(accounts[0])
      .call({ from: accounts[0] });
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
    const record = JSON.parse(updateProfileRecords);
    console.log(record);
    record.data.patient = accounts[0];
    record.data.timeCreated = Date.now();
    const id = await postRecord(record);
    if (id) {
      await contract.methods
        .updateOriginalRecord(accounts[0], id)
        .send({ from: accounts[0] });
    }
  };

  const updateProfileCopy = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (updateProfileRecords === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods.updateCopyRecord().send({ from: accounts[0] });
  };

  const assignDoctor = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (doctorAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods
      .assignDoctor(doctorAddress)
      .send({ from: accounts[0] });
  };

  const revokeDoctor = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (doctorAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods
      .revokeDoctor(doctorAddress)
      .send({ from: accounts[0] });
  };

  const assignInsurer = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (insurerAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods
      .assignInsurer(insurerAddress)
      .send({ from: accounts[0] });
  };

  const revokeInsurer = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (insurerAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await contract.methods
      .revokeInsurer(insurerAddress)
      .send({ from: accounts[0] });
  };

  const activateProfile = async (e) => {
    console.log("activate Profile");
    await contract.methods.activatePatientProfile().send({ from: accounts[0] });
  };

  const deactivateProfile = async (e) => {
    console.log("deactivate Profile");
    await contract.methods
      .deactivatePatientProfile()
      .send({ from: accounts[0] });
  };

  const getDoctors = async (e) => {
    console.log("get doctors");
    const doctorList = await contract.methods
      .getDoctors()
      .call({ from: accounts[0] });
    setDoctorList(
      doctorList.filter((a) => a !== blankAddress).map((a) => <div>{a}</div>)
    );
  };

  const getInsurers = async (e) => {
    console.log("get insurers");
    const insurerList = await contract.methods
      .getInsurers()
      .call({ from: accounts[0] });
    setInsurerList(
      insurerList.filter((a) => a !== blankAddress).map((a) => <div>{a}</div>)
    );
  };

  return (
    <div className="btns">
      <div>
        <input
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          type="password"
        />
        <button onClick={setNewKeyPair} style={{ marginRight: 10 }}>
          set new key pair
        </button>
        <button onClick={retrieveKeyPair} style={{ marginRight: 10 }}>
          retrieve key pair
        </button>
      </div>
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

        <button onClick={getInsurers} style={{ marginLeft: 10 }}>
          Get My Insurers
        </button>
      </div>

      <div style={{ flexDirection: "column" }}>
        <p>Medical History</p>
        {medicalHistory ? medicalHistory : <p>No medical records</p>}
      </div>

      <div style={{ flexDirection: "column" }}>
        <p>Medical History Copy</p>
        {medicalHistoryCopy ? (
          medicalHistoryCopy
        ) : (
          <p>No copy of medical records</p>
        )}
      </div>

      <div style={{ flexDirection: "column" }}>
        <p>List of My Doctors</p>
        {doctorList ? doctorList : <p>No doctors retrieved</p>}
      </div>

      <div style={{ flexDirection: "column" }}>
        <p>List of My Insurers</p>
        {insurerList ? insurerList : <p>No doctors retrieved</p>}
      </div>

      <div className="input-btn">
        <textarea
          rows={15}
          cols={70}
          value={updateProfileRecords}
          onChange={handleUpdateProfileRecord}
        ></textarea>
        <button onClick={updateProfile}>Update Profile</button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="New Record (Copy)"
          value={updateProfileCopyRecords}
          onChange={handleUpdateProfileCopyRecord}
        />
        <input
          type="text"
          placeholder="Reader Address"
          value={readerAddress}
          onChange={handleReaderAddressChange}
        />
        <button onClick={updateProfileCopy}>Update Profile (Copy)</button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Doctor's Address"
          value={doctorAddress}
          onChange={handleDoctorAddressChange}
        />
        <button onClick={assignDoctor}>Assign Doctor</button>
      </div>
      <div className="input-btn">
        <input
          type="text"
          placeholder="Doctor's Address"
          value={doctorAddress}
          onChange={handleDoctorAddressChange}
        />
        <button onClick={revokeDoctor}>Revoke Doctor</button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Insurer's Address"
          value={insurerAddress}
          onChange={handleInsurerAddressChange}
        />
        <button onClick={assignInsurer}>Assign Insurer</button>
      </div>
      <div className="input-btn">
        <input
          type="text"
          placeholder="Insurer's Address"
          value={insurerAddress}
          onChange={handleInsurerAddressChange}
        />
        <button onClick={revokeInsurer}>Revoke Insurer</button>
      </div>
    </div>
  );
}

export default ContractBtns;
