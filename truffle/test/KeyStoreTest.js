const _contract_deploy = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");
const { generateKeyPairSync } = require("crypto");

var assert = require("assert");
var KeyStore = artifacts.require("../contracts/KeyStore.sol");

contract("KeyStore", function (accounts) {
  const { publicKey, privateKey } = generateKeyPairSync("ec", {
    namedCurve: 'sect239k1',
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
  });

  before(async () => {
    keyStoreInstance = await KeyStore.deployed();
  });

  it("Store new key pairs", async () => {
    const setKeyPair = await keyStoreInstance.setKeyPair(publicKey, privateKey, {from: accounts[0]});
    truffleAssert.eventEmitted(setKeyPair, "KeyPairModified");
  });

  it("Check key pair", async () => {
    const keyPair = await keyStoreInstance.keyPairs(accounts[0]);
    assert.deepEqual([keyPair.publicKey, keyPair.privateKey], [publicKey, privateKey], "Key pair does not match");
  })
});
