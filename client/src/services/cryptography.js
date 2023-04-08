const { generateKeyPairSync, createPrivateKey } = require("crypto");

export function newKeyPair(passphrase) {
  return generateKeyPairSync("ec", {
    namedCurve: "sect239k1",
    publicKeyEncoding: {
      type: "spki",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: passphrase
    }
  });
}

export function decryptKey(encryptedPrivateKey, passphrase) {
  return createPrivateKey({
    key: encryptedPrivateKey,
    type: "pkcs8",
    format: "pem",
    passphrase: passphrase
  })
}