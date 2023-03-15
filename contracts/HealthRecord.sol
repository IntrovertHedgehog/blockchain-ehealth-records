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

    // there could be multiple types of healthRecords (create a struct for each?)
    struct healthRecord {
        address createdBy;
        address owner;
        string recordDetails;
    }

    struct patient {
        string name;
        uint age;
        address[] doctorAccessList;
        uint[] diagnosis;
        string record;
    }

    struct doctor {
        string name;
        address[] patientAccessList;
    }

    struct insurer {
        string name;
        uint count_of_patient;
        address[] PatientWhoClaimed;
        address[] DocName;
        uint[] diagnosis;
    }

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
        require(
            access[id][msg.sender] == AccessRight.OWNER,
            "Only owner is allowed for this operation"
        );
        _;
    }

    modifier viewerOnly(uint128 id) {
        require(
            access[id][msg.sender] == AccessRight.VIEWER,
            "Only viewer is allowed for this operation"
        );
        _;
    }

    modifier editorOnly(uint128 id) {
        require(
            access[id][msg.sender] == AccessRight.EDITOR,
            "Only editor is allowed for this operation"
        );
        _;
    }

    // someone want to create a record, assign a new id to him and make him owner
    function createRecord() public {
        access[nextId][msg.sender] = AccessRight.OWNER;
        nextId++;
        emit RecordCreated(nextId);
    }

    function deleteRecord(uint128 id) public ownerOnly(id) {}

    function assignAccess(
        uint128 id,
        address assignee,
        AccessRight accessRight
    ) public ownerOnly(id) {}

    function revokeAccess(uint128 id, address assignee) public ownerOnly(id) {}
}
