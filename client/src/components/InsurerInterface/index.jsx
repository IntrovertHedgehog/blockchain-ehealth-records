import React from "react";
import Title from "./Title";
import InsurerView from "./InsurerView";
import NoticeNoArtifact from "../common/NoticeNoArtifact";
import NoticeWrongNetwork from "../common/NoticeWrongNetwork";
import { useEth } from "../../contexts/EthContext";

function InsurerInterface() {
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
          <InsurerView />
        </div>
      )}
    </div>
  );
}

export default InsurerInterface;
