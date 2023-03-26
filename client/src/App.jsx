import { EthProvider } from "./contexts/EthContext";
import HealthRecord from "./components/HealthRecord";


function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <HealthRecord />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
