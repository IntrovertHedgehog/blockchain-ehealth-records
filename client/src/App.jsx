import { EthProvider } from "./contexts/EthContext";
import HealthRecord from "./components/HealthRecord";
import DoctorInterface from "./components/DoctorInterface";
import InsurerInterface from "./components/InsurerInterface";


function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <HealthRecord />
          <DoctorInterface />
          <InsurerInterface />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
