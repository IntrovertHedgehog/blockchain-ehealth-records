// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct KeyPair {
  string publicKey;
  string privateKey;
  string salt;
  string iv;
}

contract KeyStore {
  mapping(address => KeyPair) public keyPairs;

  event KeyPairModified(address owner);

  function setKeyPair(KeyPair memory newKeyPair) public {
    keyPairs[msg.sender].publicKey = newKeyPair.publicKey;
    keyPairs[msg.sender].privateKey = newKeyPair.privateKey;
    keyPairs[msg.sender].salt = newKeyPair.salt;
    keyPairs[msg.sender].iv = newKeyPair.iv;
    emit KeyPairModified(msg.sender);
  }
}