# Roadmap

1. [X] Create wallet
   1. [X] Show mnemonics
   2. [X] Ask to confirm
      - [X] Click on tag to place a word
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

5. [X] Wallet
   1. [X] Overview screen
      1. [X] Balance
      2. [X] Network/API status
      3. [X] Transactions/Rewards overview
   2. [X] Transactions
      1. [X] List
      2. [X] Details
   3. [X] Rewards
      1. [X] List
   4. [X] Manage accounts
      1. [X] Create new
      2. [X] Rename
      3. [X] Delete
      4. [X] View only accounts (see Y)
   5. [X] Manage keys
      1. [X] Create new
      2. [X] Import secret key
      3. [X] Import from Ledger
      4. [X] Delete (?)
      5. [X] Export secret key
   6. [X] Send transaction
      1. [X] Single signature
         // Just sign with selected account
      2. [X] Multiple Signatures
         1. [X] Sign with selected account
         2. [X] Sign with another account in the wallet
         3. [X] Parse transaction and signatures (that sent by other party) and sign
      3. [X] Support all TX kinds
         1. [X] SingleSig.Spawn
         2. [X] SingleSig.Spend
         3. [X] MultiSig.Spawn
         4. [X] MultiSig.Spend
         5. [X] Vesting.Drain
         6. [X] Vault.Spawn
   7. [X] Sign message
   8. [X] Verify signed message

6. [ ] Settings
   1. [X] Network settings
      - RPC
      - Remote node status
      1. [X] Add network
      2. [X] Edit/view network (?)
      3. [X] Delete network
   2. [ ] Change password

7. [X] Backup wallet
   1. [X] Show mnemonics
   2. [X] Export wallet file

--

Features

- [X] Lock wallet when idle for some time

- [X] Update wallet format to allow adding other account types, view-only accounts, etc

- [X] Publish changed @spacemesh/ed25519-bip32
  0. [X] Make it work well for smapp-lite
  1. [X] Make it works without breaking change...
  2. [ ] Open PR (to sdk repo)
  3. [X] Publish to NPM
  4. [X] Update smapp-lite/package.json

- [X] Add VirtualScroll on WalletScreen

- [X] Auto-fetch data on switching account / network

- [ ] Add cache (service worker) for static resources (to allow working offline)

- [ ] Add cache for API requests (if possible to replace POST with GET on API side)

- [X] Auto-fetch transactions and rewards periodically

- [X] Add SMH/Smidge Inputs

- [ ] Add QR Code scanner

- [ ] Load more transactions / rewards (now it is limited to latest 1000)

- [X] Session stickiness