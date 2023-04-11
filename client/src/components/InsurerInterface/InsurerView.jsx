import React from "react";
import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { useGlobalState } from "../GlobalState";
import { getRecord } from "../../services/records";
import { decryptData } from "../../services/cryptography";
import BigNumber from "bignumber.js";

const oneEth = new BigNumber(1000000000000000000); // 1 eth

export default function InsurerView() {
  const {
    state: { contracts, accounts },
  } = useEth();
  const healthRecord = contracts[0];
  const [patientAddress, setPatientAddress] = useState("");
  const [patientMedicalHistory, setPatientMedicalHistory] = useState([]);
  const [isUpdated, setIsUpdated] = useState("Method not called yet");
  const [value, setValue] = useState('');
  const [ciRecord, setCiRecord] = useState('');
  const [globalState] = useGlobalState();

  const myKeys = globalState.myKeys;

  const handlePatientAddressChange = (e) => {
    setPatientAddress(e.target.value);
  };

  const activateInsurerProfile = async (e) => {
    console.log("activate Insurer Profile");
    await healthRecord.methods
      .activateInsurerProfile()
      .send({ from: accounts[0] });
  };

  const readCopyProfile = async () => {
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

  const copyRecordIsUpdated = async () => {
    const isUpdated = await healthRecord.methods
      .copyRecordIsUpdated(patientAddress, accounts[0])
      .call({ from: accounts[0] });
    if (isUpdated) {
      setIsUpdated("Updated");
    } else {
      setIsUpdated("Not Updated");
    }
  };

  const retrieveCI = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (patientAddress === "") {
      alert("Please enter a value to write.");
      return;
    }

    healthRecord.methods
      .getRecordCI(patientAddress)
      .call({ from: accounts[0] })
      .then((identifier) => getRecord(identifier))
      .then(async (encryptedRecord) => ({
        ...encryptedRecord,
        data: JSON.parse(
          await decryptData(encryptedRecord.data, myKeys.privateKey)
        ),
      }))
      .then((record) => JSON.stringify(record, null, 3))
      .then((record) => (
        <div>
          <pre>{record}</pre>
          <br />
        </div>
      ))
      .then((ciRecord) => setCiRecord(ciRecord));
  };

  const validatePatientClaim = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (patientAddress === "") {
      alert("Please enter a value to write.");
      return;
    }
    await healthRecord.methods
      .validateCIClaim(patientAddress)
      .send({ from: accounts[0] });
  };

  const reimbursePatientClaim = async (e) => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (patientAddress === "") {
      alert("Please enter a value to write.");
      return;
    }

    const valueWei = oneEth.multipliedBy(value).toFixed(0);

    await healthRecord.methods
      .reimburseCIClaim(patientAddress)
      .send({ from: accounts[0], value: valueWei });
  };

  return (
    <div className="btns">
      <div>
        <button onClick={activateInsurerProfile} style={{ marginLeft: 10 }}>
          Activate Insurer Profile
        </button>
      </div>

      <div style={{ flexDirection: "column" }}>
        <h3>Medical History Copy</h3>
        {patientMedicalHistory ? (
          patientMedicalHistory
        ) : (
          <p>No copy of medical records</p>
        )}
      </div>

      <div style={{ flexDirection: "column" }}>
        <h3>Check if Copy is Updated</h3>
        {isUpdated ? isUpdated : <p>error</p>}
      </div>

      <div style={{ flexDirection: "column" }}>
        <h3>Submitted Critical Illness Record</h3>
        {ciRecord ? ciRecord : <p>No CI record retrieved</p>}
      </div>

      <div className="input-btn">
        <input
          type="text"
          placeholder="Patient Address"
          value={patientAddress}
          onChange={handlePatientAddressChange}
        />

        <button onClick={readCopyProfile}>Retrieve Copy of Records</button>
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

      <div className="input-btn">
        <input
          type="text"
          placeholder="Patient Address"
          value={patientAddress}
          onChange={handlePatientAddressChange}
        />

        <button onClick={retrieveCI}>Retrieve CI Record</button>
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
        <input
          type="number"
          placeholder="value (ETH)"
          value={value}
          onChange={e => setValue(e.target.value)}
        />

        <button onClick={reimbursePatientClaim}>
          Reimburse Patient CI Claim
        </button>
      </div>
    </div>
  );
}
