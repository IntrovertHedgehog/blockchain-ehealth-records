import React from "react";
import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { getRecord, postRecord } from "../../services/records";
import {
  encryptData,
  decryptData,
  importPublicKey,
} from "../../services/cryptography";
import { useGlobalState } from "../GlobalState";

export default function DoctorView() {
  const {
    state: { contracts, accounts },
  } = useEth();
  const healthRecord = contracts[0];
  const keyStore = contracts[1];
  const [patientAddress, setPatientAddress] = useState("");
  const [patientMedicalHistory, setPatientMedicalHistory] = useState([]);
  const [updateProfileRecords, setUpdateProfileRecords] = useState("");
  const [isUpdated, setIsUpdated] = useState("Method not called yet");
  const [globalState] = useGlobalState();

  const myKeys = globalState.myKeys;

  const handlePatientAddressChange = (e) => {
    setPatientAddress(e.target.value);
  };

  const retrieveRecords = async () => {
    const retrievedPatientMedicalHistory = await healthRecord.methods
      .readProfile(patientAddress, false)
      .call({ from: accounts[0] });

    console.log(retrievedPatientMedicalHistory);

    const recordHistoryEnc = (
      await Promise.all(
        retrievedPatientMedicalHistory
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
    setPatientMedicalHistory(recordHistory);
  };

  const updateProfile = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (updateProfileRecords === "") {
      alert("Please enter a value to write.");
      return;
    }

    const patientKeyPair = await keyStore.methods
      .keyPairs(patientAddress)
      .call({ from: accounts[0] });

    console.log(patientKeyPair);
    const patientPublicKey = await importPublicKey(patientKeyPair.publicKey);
    const index = (
      await healthRecord.methods
        .readProfile(patientAddress, true)
        .call({ from: accounts[0] })
    ).length;
    const record = JSON.parse(updateProfileRecords);
    record.data.patientAddress = patientAddress;
    record.data.timeCreated = Date.now();
    record.data.createdBy = accounts[0];
    record.data.createdByDoctor = true;
    record.index = index;
    console.log(record);
    record.data = await encryptData(record.data, patientPublicKey);
    console.log(record);
    const id = await postRecord(record);
    if (id) {
      await healthRecord.methods
        .updateOriginalRecord(patientAddress, id)
        .send({ from: accounts[0] });
    }
  };

  const copyRecordIsUpdated = async () => {
    const diff = await healthRecord.methods
      .copyRecordIsUpdated(patientAddress, accounts[0])
      .call({ from: accounts[0] }).then(Number);
    if (diff === 0) {
      setIsUpdated("Your copy of patient profile is updated!");
    } else {
      setIsUpdated(
        `Your copy is ${diff} record${diff - 1 ? "s" : ""} behind the original.`
      );
    }
  };

  return (
    <div className="btns">
      <div style={{ flexDirection: "column" }}>
        <h3>Patient's Medical History</h3>
        {patientMedicalHistory ? (
          patientMedicalHistory
        ) : (
          <p>No medical records retrieved</p>
        )}
      </div>

      <div style={{ flexDirection: "column" }}>
        <h3>Check if Copy is Updated</h3>
        {isUpdated ? isUpdated : <p>error</p>}
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Patient Address"
          value={patientAddress}
          onChange={handlePatientAddressChange}
        />

        <button onClick={retrieveRecords}>Retrieve Records</button>
      </div>

      <div className="input-btn">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            type="text"
            placeholder="Patient Address"
            value={patientAddress}
            onChange={handlePatientAddressChange}
          />
          &nbsp;
          <textarea
            rows={15}
            cols={65}
            value={updateProfileRecords}
            onChange={(e) => setUpdateProfileRecords(e.target.value)}
          ></textarea>
        </div>
        <button onClick={updateProfile}>Add Record to Patient Profile</button>
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Patient Address"
          value={patientAddress}
          onChange={handlePatientAddressChange}
        />

        <button onClick={copyRecordIsUpdated}>Check if Copy is Updated</button>
      </div>
    </div>
  );
}
