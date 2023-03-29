import { EthProvider } from "./contexts/EthContext";
import HealthRecord from "./components/HealthRecord";
import DoctorInterface from "./components/DoctorInterface";


function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <HealthRecord />
          <DoctorInterface />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
