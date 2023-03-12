pragma solidity ^0.8.0;

contract HealthRecord {
    
    enum AccessRight {
        OWNER,
        VIEWER,
        EDITOR
    }

    // ignore this shit
    // This map an id to a hash on the database
    // mapping(uint128 => uint128) identifier;

    // access[id][person] = AccessRight.OWNER means 'person' owns the record with id='id'
    mapping(uint128 => mapping(address => AccessRight)) access;
    uint128 nextId;

    event RecordCreated(uint128 id);
    event RecordEditRequested(uint128 id, uint128 newKey);
    event RecordEdited(uint128 id);
    event RecordDeleted(uint128 id);
    event RecordAccessAssinged(uint128 id);
    event RecordAccessRevoked(uint128 id); 

    constructor() {
        nextId = 0;
    }

    modifier ownerOnly(uint128 id) {
        require(access[id][msg.sender]== AccessRight.OWNER, 'Only owner is allowed for this operation');
        _;
    }

    modifier viewerOnly(uint128 id) {
        require(access[id][msg.sender] == AccessRight.VIEWER, 'Only viewer is allowed for this operation');
        _;
    }
    
    modifier editorOnly(uint128 id) {
        require(access[id][msg.sender] == AccessRight.EDITOR, 'Only editor is allowed for this operation');
        _;
    }
    // someone want to create a record, assign a new id to him and make him owner
    function createRecord() public {
        access[nextId][msg.sender] = AccessRight.OWNER;
        nextId++;
        emit RecordCreated(nextId);
    }

    function deleteRecord(uint128 id) ownerOnly(id) public {}

    function assignAccess(uint128 id, address assignee, AccessRight accessRight) ownerOnly(id) public {}

    function revokeAccess(uint128 id, address assignee) ownerOnly(id) public {}

}