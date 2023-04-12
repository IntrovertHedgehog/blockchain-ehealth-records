import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { getRecord, postRecord } from "../../services/records";
import {
  decryptData,
  encryptData,
  importPublicKey,
} from "../../services/cryptography";
import { useGlobalState } from "../GlobalState";
import BigNumber from "bignumber.js";

const oneEth = new BigNumber(1000000000000000000); // 1 eth

const blankAddress = `0x${"0".repeat(40)}`;

export default function PatientView() {
  const {
    state: { contracts, accounts },
  } = useEth();
  const healthRecord = contracts[0];
  const keyStore = contracts[1];
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medicalHistoryCopy, setMedicalHistoryCopy] = useState("");
  const [updateProfileRecords, setUpdateProfileRecords] = useState("");
  const [doctorList, setDoctorList] = useState([]);
  const [insurerList, setInsurerList] = useState([]);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [insurerAddress, setInsurerAddress] = useState("");
  const [readerAddress, setReaderAddress] = useState("");
  const [globalState] = useGlobalState();
  const [isCICoverred, setIsCICoverred] = useState('');
  const [value, setValue] = useState("");
  const [recordIndex, setRecordIndex] = useState("");
  const [ciValidity, setCIValidity] = useState("");

  const myKeys = globalState.myKeys;

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

    const index = (
      await healthRecord.methods
        .readProfile(accounts[0], true)
        .call({ from: accounts[0] })
    ).length;

    const record = JSON.parse(updateProfileRecords);
    record.data.patientAddress = accounts[0];
    record.data.timeCreated = Date.now();
    record.data.createdBy = accounts[0];
    record.data.createdByDoctor = false;
    record.index = index;
    const rawRecord = record.data;
    console.log(rawRecord);
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
          originalRecord: r.identifier,
          data: JSON.parse(await decryptData(r.data, myKeys.privateKey)),
        };
      })
    );

    const ids = (
      await Promise.all(
        recordHistoryDec.map(async (record) => {
          record.data = await encryptData(record.data, readerPublicKey);
          const id = await postRecord(record);
          return id;
        })
      )
    ).filter((id) => id);

    console.log(ids);

    ids.forEach((id) =>
      healthRecord.methods
        .updateCopyRecord(accounts[0], readerAddress, id)
        .send({ from: accounts[0] })
    );
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

  const purchaseCI = (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (insurerAddress === "" || value === 0) {
      alert("Please enter a value to write.");
      return;
    }

    const valueWei = oneEth.multipliedBy(value).toFixed(0);
    healthRecord.methods
      .purchaseCICoverage(insurerAddress)
      .send({ from: accounts[0], value: valueWei });
  };

  const checCICoverage = (e) => {
    healthRecord.methods.getPatientIsInsuredCI()
      .call({ from: accounts[0] })
      .then(setIsCICoverred);
  };

  const submitCI = (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (insurerAddress === "" || recordIndex === null) {
      alert("Please enter a value to write.");
      return;
    }

    healthRecord.methods
      .submitCriticalIllness(insurerAddress, recordIndex)
      .send({ from: accounts[0] });
  };

  const checkValidation = (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (insurerAddress === "" || recordIndex === null) {
      alert("Please enter a value to write.");
      return;
    }

    healthRecord.methods
      .getValidityCI(accounts[0], insurerAddress)
      .call({ from: accounts[0] })
      .then(setCIValidity);
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
        <button onClick={checCICoverage} style={{ marginLeft: 10 }}>
          Check CI Insured
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

      <div style={{ flexDirection: "column" }}>
        <h3>CI Coverage Status</h3>
        {isCICoverred === true ? (
          <p>Your critical illness is coverred</p>
        ) : isCICoverred === false ? (
          <p>Your critical illness is <b>not</b> coverred</p>
        ) : null}
      </div>
      
      <div style={{ flexDirection: "column" }}>
        <h3>CI Validity Check</h3>
        {ciValidity === true ? (
          <p>Congratulations! Your CI is validated by insurer.</p>
        ) : ciValidity === false ? (
          <p>Your CI submission is being processed.</p>
        ) : null}
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
          placeholder="Reader's Address"
          value={readerAddress}
          onChange={handleReaderAddressChange}
        ></input>
        <button onClick={readCopyProfile} style={{ marginRight: 10 }}>
          Read Profile Copy
        </button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Reader's Address"
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

      <div className="input-btn">
        <input
          type="text"
          placeholder="Insurer's Address"
          value={insurerAddress}
          onChange={handleInsurerAddressChange}
        />
        <input
          type="number"
          placeholder="value (ETH)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={purchaseCI}>Purchase CI</button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Insurer's Address"
          value={insurerAddress}
          onChange={handleInsurerAddressChange}
        />
        <input
          type="number"
          placeholder="CI record index"
          value={recordIndex}
          onChange={(e) => setRecordIndex(e.target.value)}
        />
        <button onClick={submitCI}>Submit CI</button>
      </div>
      <div className="input-btn">
        <input
          type="text"
          placeholder="Insurer's Address"
          value={insurerAddress}
          onChange={handleInsurerAddressChange}
        />
        <button onClick={checkValidation}>Check CI Validation</button>
      </div>
    </div>
  );
}
