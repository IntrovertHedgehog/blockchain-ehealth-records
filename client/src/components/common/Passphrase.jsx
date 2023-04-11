import { useEth } from "../../contexts/EthContext";
import { useGlobalState } from "../GlobalState";
import { generateKeyPair, importKeyPair } from "../../services/cryptography";
import { useState } from "react";

export default function Passphrase() {
  const {
    state: { contracts, accounts },
  } = useEth();
  const keyStore = contracts[1];

  const [, updateGlobalState] = useGlobalState();
  const [showPass, setShowPass] = useState(true);
  const [passphrase, setPassphrase] = useState("");

  const setNewKeyPair = async () => {
    const keyPair = await generateKeyPair(passphrase);
    await keyStore.methods
      .setKeyPair(keyPair.publish)
      .send({ from: accounts[0] });
    updateGlobalState("myKeys", keyPair.bare);
    console.log(keyPair.bare);
    setPassphrase("");
    setShowPass(false);
  };

  const retrieveKeyPair = async () => {
    try {
      const storedKeyPair = await keyStore.methods
        .keyPairs(accounts[0])
        .call({ from: accounts[0] });
      console.log(storedKeyPair);
      const keyPair = await importKeyPair(storedKeyPair, passphrase);
      updateGlobalState("myKeys", keyPair);
      console.log(keyPair);
      setShowPass(false);
    } catch (error) {
      console.error(error);
    } finally {
      setPassphrase("");
    }
  };

  return (
    showPass && (
      <div className="demo">
        <h2>Passphrase</h2>
        <div className="contract-container">
          <div className="btns">
            <div>
              <input
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                type="password"
              />
              <button onClick={setNewKeyPair} style={{ marginRight: 10 }}>
                set new key pair
              </button>
              <button onClick={retrieveKeyPair} style={{ marginRight: 10 }}>
                retrieve key pair
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
