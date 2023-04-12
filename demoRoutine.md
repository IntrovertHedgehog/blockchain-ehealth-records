### Installation
...

### Setup
- Ganache
- truffle console + migrate
- firebase (simulators)
- client (web)
- Metamask
- Browsers (3 browser with metamask for different accounts)


### Routines
#### 1. All
- Try add new record before passphrase (fail)
- Set passphrase for patient
- Show on truffle console stored key pairs
- Enter wrong passphrase (error in console)
- Enter correct passphrase
- Set passphrase to doctor and insurer

#### 2. Patient
- Add new record (fail)
- Activate profile
- Add new record (succeed)
- Show profile on truffle console
- Show profile on firebase (encrypted)
- Read profile

#### 3. Patient + Doctor
- Assign doctor
- Read patient profile (nothing)
- Update doctor copy
- read patietn profile
- Patient add new record 
- Doctor check updated 
- Patient update doctor copy
- Doctor check updated
- Doctor read profile
- Patient read doctor copy
- Doctor add new record
- Patient check profile
- Revoke doctor

#### 4. Patient + Insurer
- Insurer activate profile
- Assign insurer
- isurer check updated
- patient update insurer copy
- insurer read patient copy
- patient purchase CI
- Patient check CI ****
- patient submit CI
- Insurer get CI record
- Patient check CI validation
- Insurer validate CI
- Patient check CI validation (wait for reimbursement)
- Check patient account
- Insurer reimburse (2 ETH)
- Revoke insurer