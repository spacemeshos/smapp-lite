# Roadmap

1. [X] Create wallet
   1. [X] Show mnemonics
   2. [X] Ask to confirm
   3. [X] Ask display name and password

2. [X] Recover from mnemonics
   1. [X] Ask mnemonics
   2. [X] Ask password

3. [X] Import wallet file
   1. [X] FileReader
   2. [X] Ask password

--

4. [X] Unlock screen
   1. [X] Password input + button -> Unlock
   2. [X] Show wipe link -> Alert -> wipe -> create wallet

--

5. [ ] Wallet
   1. [X] Overview screen
      1. [X] Balance
      2. [X] Network/API status
      3. [X] Transactions/Rewards overview
   2. [X] Transactions
      1. [X] List
      2. [X] Details
   3. [X] Rewards
      1. [X] List
   4. [ ] Manage accounts
      1. [ ] Create new
      2. [ ] Rename
      3. [ ] Delete
      4. [ ] View only accounts (see Y)
   5. [X] Manage keys
      1. [X] Create new
      2. [X] Import secret key
      3. [ ] Import from Ledger
      4. [ ] Delete (?)
      5. [X] Export secret key
   6. [ ] Send transaction
      1. [ ] Single signature
         // Just sign with selected account
      2. [ ] Multiple Signatures
         1. [ ] Sign with selected account
         2. [ ] Sign with another account in the wallet
         3. [ ] Parse transaction and signatures (that sent by other party) and sign
      3. [ ] Support all TX kinds
         1. [ ] SingleSig.Spawn
         2. [ ] SingleSig.Spend
         3. [ ] MultiSig.Spawn
         4. [ ] MultiSig.Spend
         5. [ ] Vesting.Drain
         6. [ ] Vault.Spawn
   7. [ ] Sign message
   8. [ ] Verify signed message

6. [ ] Settings
   1. [X] Network settings
      - RPC
      - Remote node status
      1. [X] Add network
      2. [ ] Edit/view network (?)
      3. [ ] Delete network
   2. [ ] Change password

7. [X] Backup wallet
   1. [X] Show mnemonics
   2. [X] Export wallet file

--

Z. [X] Lock wallet when idle for some time

Y. [X] Update wallet format to allow adding other account types, view-only accounts, etc

X. [X] Publish changed @spacemesh/ed25519-bip32
   0. [X] Make it work well for smapp-lite
   1. [X] Make it works without breaking change...
   2. [ ] Open PR (to sdk repo)
   3. [X] Publish to NPM
   4. [X] Update smapp-lite/package.json

W. [X] Add VirtualScroll on WalletScreen

V. [X] Auto-fetch data on switching account / network

U. [ ] Add cache (service worker) for static resources (to allow working offline)

T. [ ] Add cache for API requests (if possible to replace POST with GET on API side)

S. [ ] Auto-fetch transactions and rewards periodically

--

## Node/infra side

[ ] Allow CORS
[ ] Reward ID — we need to have possibility to get same ID as in Explorer
[ ] APIv2: RewardsService/List is not available ATM
[ ] APIv2: TransactionService