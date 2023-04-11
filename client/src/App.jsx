import { EthProvider } from "./contexts/EthContext";
import PatientInterface from "./components/PatientInterface";
import DoctorInterface from "./components/DoctorInterface";
import InsurerInterface from "./components/InsurerInterface";


function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <PatientInterface />
          <DoctorInterface />
          <InsurerInterface />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
