function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function ab2str(ab) {
  const bufView = new Uint8Array(ab);
  let str = "";
  for (let i = 0; i < bufView.byteLength; i++) {
    str += String.fromCharCode(bufView[i]);
  }
  return str;
}

function toPem(key, isPrivateKey) {
  const [pemHeader, pemFooter] = isPrivateKey
    ? ["-----BEGIN ENCRYPTED PRIVATE KEY-----\n", "\n-----END ENCRYPTED PRIVATE KEY-----"]
    : ["-----BEGIN PUBLIC KEY-----\n", "\n-----END PUBLIC KEY-----"];

  return (
    pemHeader +
    window.btoa(ab2str(key)) +
    pemFooter
  );
}

function importKey(pem, isPrivateKey) {
  const [pemHeader, pemFooter] = isPrivateKey
  ? ["-----BEGIN ENCRYPTED PRIVATE KEY-----\n", "\n-----END ENCRYPTED PRIVATE KEY-----"]
  : ["-----BEGIN PUBLIC KEY-----\n", "\n-----END PUBLIC KEY-----"];

  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length
  );
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  return binaryDer;
}

export async function importPublicKey(publicPem) {
  const publicKeyab = importKey(publicPem, false);
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyab,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  return publicKey;
}

export async function importKeyPair(keyPair, password) {
  const publicKey = await importPublicKey(keyPair.publicKey);

  const salt = keyPair.salt;
  const iv = keyPair.iv;

  const privateKeyab = importKey(keyPair.privateKey, true);
  const saltab = str2ab(window.atob(salt));
  const ivab = str2ab(window.atob(iv));
  const keyMaterial = await getKeyMaterial(password);
  const unwrappingKey = await getKey(keyMaterial, saltab);

  const privateKey = await window.crypto.subtle.unwrapKey(
    "pkcs8",
    privateKeyab,
    unwrappingKey,
    {
      name: "AES-GCM",
      iv: ivab,
    },
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );

  return {
    publicKey: publicKey,
    privateKey: privateKey,
  };
}

/*
Get some key material to use as input to the deriveKey method.
The key material is a password supplied by the user.
*/
async function getKeyMaterial(password) {
  const enc = new TextEncoder();
  return await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

/*
Given some key material and some random salt
derive an AES-GCM key using PBKDF2.
*/
function getKey(keyMaterial, salt) {
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["wrapKey", "unwrapKey"]
  );
}

/*
Wrap the given key.
*/
async function wrapCryptoKey(password, keyToWrap) {
  // get the key encryption key
  const keyMaterial = await getKeyMaterial(password);
  let salt = window.crypto.getRandomValues(new Uint8Array(16));
  const wrappingKey = await getKey(keyMaterial, salt);
  let iv = window.crypto.getRandomValues(new Uint8Array(12));

  return {
    privateKey: await window.crypto.subtle.wrapKey(
      "pkcs8",
      keyToWrap,
      wrappingKey,
      {
        name: "AES-GCM",
        iv,
      }
    ),
    salt: window.btoa(ab2str(salt)),
    iv: window.btoa(ab2str(iv)),
  };
}

export async function generateKeyPair(password) {
  const bareKeys = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await window.crypto.subtle
    .exportKey("spki", bareKeys.publicKey)
    .then((k) => toPem(k, false));

  const wrappedPrivateKey = await wrapCryptoKey(
    password,
    bareKeys.privateKey
  ).then((keyset) => ({
    ...keyset,
    privateKey: toPem(keyset.privateKey, true),
  }));

  return {
    publish: { publicKey: publicKey, ...wrappedPrivateKey },
    bare: bareKeys,
  };
}

export function encryptData(dataObject, publicKey) {
  const dataString = JSON.stringify(dataObject);
  const dataab = str2ab(dataString);
  return window.crypto.subtle
    .encrypt({ name: "RSA-OAEP" }, publicKey, dataab)
    .then((cipherab) => window.btoa(ab2str(cipherab)));
}

export function decryptData(cipherStr, privateKey) {
  console.log(cipherStr);
  const cipherab = str2ab(window.atob(cipherStr));
  return window.crypto.subtle
    .decrypt({ name: "RSA-OAEP" }, privateKey, cipherab)
    .then((plainab) => ab2str(plainab));
}
