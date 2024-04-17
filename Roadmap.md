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
   2. [X ] Ask password

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
   5. [ ] Manage keys
      1. [ ] Create new
      2. [ ] Delete (?)
      3. [ ] Ledger Support
   6. [ ] Spawn account
   7. [ ] Send transaction
   8. [ ] Sign message
   9. [ ] Verify signed message

6. [ ] Settings
   1. [ ] Network settings
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

Y. [ ] Update wallet format to allow adding view-only accounts only by address, not publicKey

X. [ ] Publish changed @spacemesh/ed25519-bip32
   0. [ ] Make it work well for smapp-lite
   1. [ ] Make it works without breaking change...
   2. [ ] Open PR
   3. [ ] Publish to NPM
   4. [ ] Update smapp-lite/package.json

W. [ ] Transitions on route change

V. [ ] Add VirtualScroll on WalletScreen

Q. [X] Auto-fetch data on switching account / network



--

## Node side

[ ]  Allow CORS
