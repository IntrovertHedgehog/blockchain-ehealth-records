import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { getRecord, postRecord } from "../../services/records";
import {
  decryptData,
  encryptData,
  generateKeyPair,
  importKeyPair,
  importPublicKey,
} from "../../services/cryptography";

const blankAddress = `0x${"0".repeat(40)}`;

function ContractBtns() {
  const {
    state: { contracts, accounts },
  } = useEth();
  const healthRecord = contracts[0];
  const keyStore = contracts[1];
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
  const [myKeys, setMyKeys] = useState({});
  const [showPass, setShowPass] = useState(true);

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

  const setNewKeyPair = async () => {
    const keyPair = await generateKeyPair(passphrase);
    await keyStore.methods
      .setKeyPair(keyPair.publish)
      .send({ from: accounts[0] });
    setMyKeys(keyPair.bare);
    console.log(keyPair.bare);
    setPassphrase("");
    setShowPass(false);
  };

  const retrieveKeyPair = async () => {
    try {
      const storedKeyPair = await keyStore.methods
        .keyPairs(accounts[0])
        .call({ from: accounts[0] });
      console.log(storedKeyPair);
      const keyPair = await importKeyPair(storedKeyPair, passphrase);
      setMyKeys(keyPair);
      console.log(keyPair);
      setShowPass(false);
    } catch (error) {
      console.error(error);
    } finally {
      setPassphrase("");
    }
  };

  const readProfile = async () => {
    const retrievedMedicalHistory = await healthRecord.methods
      .readProfile(accounts[0], true)
      .call({ from: accounts[0] });
    console.log(retrievedMedicalHistory);
    const recordHistoryEnc = (
      await Promise.all(
        retrievedMedicalHistory
          .filter((r) => r)
          .map(async (r) => await getRecord(r))
      )
    ).filter((r) => r);
    console.log(recordHistoryEnc);
    const recordHistory = (
      await Promise.all(
        recordHistoryEnc.map(async (r) => {
          console.log(r);
          return {
            ...r,
            data: JSON.parse(await decryptData(r.data, myKeys.privateKey)),
          };
        })
      )
    )
      .map((r) => JSON.stringify(r, null, 3))
      .map((r) => (
        <div>
          <pre>{r}</pre>
          <br />
        </div>
      ));
    setMedicalHistory(recordHistory);
  };

  const readCopyProfile = async () => {
    const retrievedMedicalHistoryCopyId = await healthRecord.methods
      .readCopyProfiles(readerAddress)
      .call({ from: accounts[0] });

    const retrievedMedicalHistoryCopy = (
      await Promise.all(
        retrievedMedicalHistoryCopyId
          .filter((id) => id)
          .map((id) => getRecord(id))
      )
    )
      .filter((record) => record)
      .map((record) => ({
        ...record,
        data: `<encrypted with 0x...${readerAddress.substring(39)}'s key>`,
      }))
      .map((r) => JSON.stringify(r, null, 3))
      .map((r) => (
        <div>
          <pre>{r}</pre>
          <br />
        </div>
      ));

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
    record.data.patientAddress = accounts[0];
    record.data.timeCreated = Date.now();
    console.log(record);
    record.data = await encryptData(record.data, myKeys.publicKey);
    console.log(record);
    const id = await postRecord(record);
    if (id) {
      await healthRecord.methods
        .updateOriginalRecord(accounts[0], id)
        .send({ from: accounts[0] });
    }
  };

  const updateProfileCopy = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (readerAddress === "") {
      alert("Please enter a value to write.");
      return;
    }

    const readerKeyPair = await keyStore.methods
      .keyPairs(readerAddress)
      .call({ from: accounts[0] });

    console.log(readerKeyPair);
    const readerPublicKey = await importPublicKey(readerKeyPair.publicKey);

    const copyId = await healthRecord.methods
      .readCopyProfiles(readerAddress)
      .call({ from: accounts[0] });
    const originalId = await healthRecord.methods
      .readProfile(accounts[0], true)
      .call({ from: accounts[0] });

    console.log(copyId, originalId);

    const recordHistoryEnc = (
      await Promise.all(
        originalId
          .slice(copyId.length)
          .filter((r) => r)
          .map(async (r) => await getRecord(r))
      )
    ).filter((r) => r);

    const recordHistoryDec = await Promise.all(
      recordHistoryEnc.map(async (r) => {
        console.log(r);
        return {
          ...r,
          data: JSON.parse(await decryptData(r.data, myKeys.privateKey)),
        };
      })
    );

    recordHistoryDec.forEach(async (record) => {
      record.data = await encryptData(record.data, readerPublicKey);
      const id = await postRecord(record);
      if (id) {
        await healthRecord.methods
          .updateCopyRecord(accounts[0], readerAddress, id)
          .send({ from: accounts[0] });
      }
    });
  };

  const assignDoctor = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (doctorAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await healthRecord.methods
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
    await healthRecord.methods
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
    await healthRecord.methods
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
    await healthRecord.methods
      .revokeInsurer(insurerAddress)
      .send({ from: accounts[0] });
  };

  const activateProfile = async (e) => {
    console.log("activate Profile");
    await healthRecord.methods
      .activatePatientProfile()
      .send({ from: accounts[0] });
  };

  const deactivateProfile = async (e) => {
    console.log("deactivate Profile");
    await healthRecord.methods
      .deactivatePatientProfile()
      .send({ from: accounts[0] });
  };

  const getDoctors = async (e) => {
    console.log("get doctors");
    const doctorList = await healthRecord.methods
      .getDoctors()
      .call({ from: accounts[0] });
    setDoctorList(
      doctorList.filter((a) => a !== blankAddress).map((a) => <div>{a}</div>)
    );
  };

  const getInsurers = async (e) => {
    console.log("get insurers");
    const insurerList = await healthRecord.methods
      .getInsurers()
      .call({ from: accounts[0] });
    setInsurerList(
      insurerList.filter((a) => a !== blankAddress).map((a) => <div>{a}</div>)
    );
  };

  return (
    <div className="btns">
      {showPass && (
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
      )}
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

        <button onClick={getDoctors} style={{ marginLeft: 10 }}>
          Get My Doctors
        </button>

        <button onClick={getInsurers} style={{ marginLeft: 10 }}>
          Get My Insurers
        </button>
      </div>

      <div style={{ flexDirection: "column" }}>
        <h3>Medical History</h3>
        {medicalHistory ? medicalHistory : <p>No medical records</p>}
      </div>

      <div style={{ flexDirection: "column" }}>
        <h3>Medical History Copy</h3>
        {medicalHistoryCopy ? (
          medicalHistoryCopy
        ) : (
          <p>No copy of medical records</p>
        )}
      </div>

      <div style={{ flexDirection: "column" }}>
        <h3>List of My Doctors</h3>
        {doctorList ? doctorList : <p>No doctors retrieved</p>}
      </div>

      <div style={{ flexDirection: "column" }}>
        <h3>List of My Insurers</h3>
        {insurerList ? insurerList : <p>No doctors retrieved</p>}
      </div>

      <div className="input-btn">
        <textarea
          rows={15}
          cols={65}
          value={updateProfileRecords}
          onChange={handleUpdateProfileRecord}
        ></textarea>
        <button onClick={updateProfile}>Update Profile</button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Reader Address"
          value={readerAddress}
          onChange={handleReaderAddressChange}
        ></input>
        <button onClick={readCopyProfile} style={{ marginRight: 10 }}>
          Read Profile Copy
        </button>
      </div>

      <div className="input-btn">
        {/* <input
          type="text"
          placeholder="New Record (Copy)"
          value={updateProfileCopyRecords}
          onChange={handleUpdateProfileCopyRecord}
        /> */}
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
