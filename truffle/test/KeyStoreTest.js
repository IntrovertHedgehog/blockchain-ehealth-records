const _contract_deploy = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");
const { generateKeyPairSync } = require("crypto");

var assert = require("assert");
var KeyStore = artifacts.require("../contracts/KeyStore.sol");

contract("KeyStore", function (accounts) {
  const keyPair = {
    ...generateKeyPairSync("ec", {
      namedCurve: "sect239k1",
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase: "passphrase",
      },
    }),
    salt: "SALT",
    iv: "IV",
  };

  const {publicKey, privateKey, salt, iv } = keyPair;

  before(async () => {
    keyStoreInstance = await KeyStore.deployed();
  });

  it("Store new key pairs", async () => {
    const setKeyPair = await keyStoreInstance.setKeyPair(
      keyPair,
      { from: accounts[0] }
    );
    truffleAssert.eventEmitted(setKeyPair, "KeyPairModified");
  });

  it("Check key pair", async () => {
    const keyPair = await keyStoreInstance.keyPairs(accounts[0]);
    assert.strictEqual(keyPair.publicKey, publicKey, "Key pair does not match");
    assert.strictEqual(
      keyPair.privateKey,
      privateKey,
      "Key pair does not match"
    );
    assert.strictEqual(keyPair.salt, salt, "Key pair does not match");
    assert.strictEqual(keyPair.iv, iv, "Key pair does not match");
  });
});
