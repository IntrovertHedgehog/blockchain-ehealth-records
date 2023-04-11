import React from "react";
import Title from "./Title";
import DoctorView from "./DoctorView";
import NoticeNoArtifact from "../Common/NoticeNoArtifact";
import NoticeWrongNetwork from "../Common/NoticeWrongNetwork";
import { useEth } from "../../contexts/EthContext";

function DoctorInterface() {
  const { state } = useEth();

  return (
    <div className="demo">
      <Title />
      {!state.artifacts ? (
        <NoticeNoArtifact />
      ) : !state.contracts ? (
        <NoticeWrongNetwork />
      ) : (
        <div className="contract-container">
          <DoctorView />
        </div>
      )}
    </div>
  );
}

export default DoctorInterface;
