import useEth from "../../contexts/EthContext/useEth";
import Title from "./Title";
import ContractBtns from "../HealthRecord/ContractBtns";
import NoticeNoArtifact from "../HealthRecord/NoticeNoArtifact";
import NoticeWrongNetwork from "../HealthRecord/NoticeWrongNetwork";

function HealthRecord() {
	const { state } = useEth();

	const healthRecordContract =
		<>
			<div className="contract-container">
				<ContractBtns />
			</div>
		</>;

	return (
		<div className="demo">
			<Title />
			{
				!state.artifact ? <NoticeNoArtifact /> :
					!state.contract ? <NoticeWrongNetwork /> :
						healthRecordContract
			}
		</div>
	);
}

export default HealthRecord;
