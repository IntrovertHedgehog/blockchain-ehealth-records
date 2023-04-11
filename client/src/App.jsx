import { EthProvider } from "./contexts/EthContext";
import PatientInterface from "./components/PatientInterface";
import DoctorInterface from "./components/DoctorInterface";
import InsurerInterface from "./components/InsurerInterface";
import Passphrase from "./components/common/Passphrase";


function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <Passphrase />
          <PatientInterface />
          <DoctorInterface />
          <InsurerInterface />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
