import useEth from "../../contexts/EthContext/useEth";
import Title from "./Title";
import ContractBtns from "./ContractBtns";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";

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
				!state.artifacts ? <NoticeNoArtifact /> :
					!state.contracts ? <NoticeWrongNetwork /> :
						healthRecordContract
			}
		</div>
	);
}

export default HealthRecord;
