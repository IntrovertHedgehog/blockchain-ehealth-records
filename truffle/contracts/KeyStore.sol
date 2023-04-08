// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct KeyPair {
  string publicKey;
  string privateKey;
}

contract KeyStore {
  mapping(address => KeyPair) public keyPairs;

  event KeyPairModified(address owner);

  function setKeyPair(string memory publicKey, string memory privateKey) public returns (string memory pb, string memory pr) {
    keyPairs[msg.sender].publicKey = publicKey;
    keyPairs[msg.sender].privateKey = privateKey;
    emit KeyPairModified(msg.sender);

    return (publicKey, privateKey);
  }
}