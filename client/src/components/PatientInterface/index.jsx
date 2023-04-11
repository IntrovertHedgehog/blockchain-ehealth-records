import { useEth } from "../../contexts/EthContext";
import Title from "./Title";
import PatientView from "./PatientView";
import NoticeNoArtifact from "../common/NoticeNoArtifact";
import NoticeWrongNetwork from "../common/NoticeWrongNetwork";

function PatientInterface() {
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
          <PatientView />
        </div>
      )}
    </div>
  );
}

export default PatientInterface;
