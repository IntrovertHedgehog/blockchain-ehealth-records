# Problem and potential solution
## How to store health records
Storing the record directly on the chain is obviously out of question, because of size constraint and privacy issue. Even if we encrypt the data on the smart contract, its size is still a concern. Therefore, it's should be more scalable to use an external database system as discussed, and we only store some kind of identifier on the chain.
To ensure the data in the external database is not tampered with, each record should be identified with its hash, so it is made sure that the identifier match the content
We need to consistently be able to associate the owner of the record with their records, too.
In summary, the identification scheme is as follow:
- In external database: store the actual record, identified with its hash
- On chain: map an `id` with a `hash` (record with id=`id` can be identified in the database with hash=`hash`)
- On chain: map an `id` with an `ownerAddress` (record with id=`id` belongs to user with address=`ownerAddress`)
In conclusion: The smart contract tell which record belong to whom, and how to find that record in the database. The database store the actual record while making sure it is not tamperred with.

## How to ensure privacy
One can say privacy is assure with anonymity of the blockchain. But the doctor and insurance cannot identify authentic owner of a record just from their account address.
=> NRIC of the owner must be on the record stored in the database
=> Record stored on the database must be encypted with a key only owner has access to
=> Has to come up with some way the doctors and insurance company can view the owner's record securely

**Potential Solution**: Owner and viewer exchange an encryption key via Diffie-Hellman through another contract, and use that key to exchange record information using a secondary repository, to avoid littering the primary database.

## How 
# Smart contract design
- The smart contract is designed revolving around the idea that patient (a.k.a owner of the record) is able to control all the viewership and editorship of their record
- Each record is associated with an `id` and a `key`:
  - `id` is a unique identifier, and doesn't change
  - `key` is the 
- Each record and address is associated with an access right (enum AccessRight):
  - OWNER: The owner of the record, this is the person who created the record and cannot be changed
  - VIEWER: The person granted the right to view the record 