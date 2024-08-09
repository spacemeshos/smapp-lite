# Main Page

1. Verify the main page loads successfully.
2. Check that the main page displays three buttons: "Create New Wallet," "Recover Your Wallet," and "Import Wallet File."
3. Ensure "Create New Wallet" button is visible and clickable.
4. Ensure "Recover Your Wallet" button is visible and clickable.
5. Ensure "Import Wallet File" button is visible and clickable.

# Create New Wallet

## Mnemonic Phrase page

1. Verify that clicking "Create New Wallet" navigates the user to the mnemonic phrase page.
2. Verify that the mnemonic phrase page loads successfully (no UI issues, errors, or latency).
3. Check that the page displays a 24-word mnemonic phrase in a numbered grid. All random.

**Back button**

1. Verify the presence and correct functionality of a "Back" button.
2. Verify that clicking "Back" navigates the user back to the main page.
3. Ensure that no mnemonic phrase information is retained when returning to the main page.

**Generate New Mnemonics button**

1. Verify the presence of a "Generate New Mnemonics" button.
2. Verify that clicking "Generate New Mnemonics" generates a new set of 24 words.
3. Ensure that the new mnemonic phrase differs from the previously generated one.

**Copy to Clipboard button**

1. Verify the presence of a "Copy to Clipboard" button.
2. Verify that clicking "Copy to Clipboard" copies the 24-word mnemonic phrase to the clipboard.
3. Ensure that a success message is shown after copying.
4. Test that the copied mnemonic phrase can be pasted correctly into another application.
5. Test that the copied mnemonic phrase can be pasted correctly into the wallet app and successfully open the correct wallet.

**Next step button**

1. Verify the presence and correct functionality of a "Next Step" button.
2. Verify that clicking "Next Step" navigates the user to the next appropriate page: Mnemonics confirmation step
3. Verify that the 24-word mnemonic phrase is carried over correctly to the next step.

## Mnemonic Confirmation Page

1. Verify the mnemonic confirmation page loads successfully.
2. Check that the page displays a 24-word mnemonic phrase from the previous step.
3. Check that the mnemonic phrase consists of 24 numbered slots, with 20 words correctly filled and 4 slots empty.
4. Ensure the 4 missing words are listed above the grid for drag-and-drop.
5. Verify that the 4 missing words can be dragged and dropped into the empty slots on the grid.
6. Ensure that each word can only be placed in one slot.
7. Ensure that only one word can be placed in one slot at a time. If there was already a word, it should pop out to the initial top position above the grid.
8. Check that a word, once placed, remains in the slot unless dragged out again.
9. Ensure that visually all words are inserted in the same way (with no additional space or visual changes)
10. Ensure the user can easily drag the word out of the incorrect slot and try again.
11. Verify that correctly placing the words into their slots provides visual feedback.
12. Ensure that an error message or visual indication is provided if the words are placed in the wrong slots, and the "Next Step" button remains inactive.

**Back button**

1. Verify the presence of a "Back" button.
2. Verify that clicking "Back" navigates the user back to the mnemonic phrase page.
3. Ensure that the mnemonic phrase is retained when returning to the mnemonic phrase page.
4. Ensure that clicking 'Back' clears all filled words and prompts the user to fill in the 4 words again.

**Next step button**

1. Verify the presence of a "Next Step" button.
2. Verify that clicking "Next Step" is only enabled when all 4 words are correctly placed in the grid.
3. Ensure that clicking "Next Step" navigates the user to the next page i.e. password setup.
4. Check behavior when attempting to click "Next Step" with only some of the words correctly placed.
5. Ensure that clicking 'Next Step' clears all filled words and prompts the user to fill in the 4 words again.

## Password Setup Page

1. Verify the password setup page loads successfully.
2. Ensure the "Set the password:" input field is visible and accepts input.
3. Ensure the "Confirm the password:" input field is visible and accepts input.
4. Verify that by default input is hidden and replaced by "*".
5. Check that the page displays eye icon buttons for both input fields.
6. Check that both input fields have the placeholder text "Enter password".
7. Verify clicking the eye icon reveals the entered password in the "Set the password:" field.
8. Verify clicking the eye icon reveals the entered password in the "Confirm the password:" field.
9. Ensure clicking the eye icon again hides the password.
10. Verify that the "Confirm the password:" field must match the "Set the password:" field.
11. Verify an appropriate error message is shown if the passwords in the "Set the password" and "Confirm the password" fields do not match.
12. Verify the system correctly handles and accepts special characters in the password fields.
13. Verify that the password is securely transmitted and not exposed in any way.
14. Ensure the app correctly handles password encryption and validation.
15. Ensure that when the input field is focused, the password requirements info is shown -  "Password should contain at least 8 chars: letters in upper and lower cases, numbers, and special characters"

**Password Requirements Validation**

1. Verify the password must be at least 8 characters long.
2. Ensure the password must include at least one uppercase letter.
3. Ensure the password must include at least one lowercase letter.
4. Ensure the password must include at least one number.
5. Ensure the password must include at least one special character.
6. Verify an appropriate error message is shown if the password does not meet the requirements.
7. Ensure that pasting passwords into the input fields is handled correctly.
8. Verify that passwords pasted into the fields must still meet the validation criteria.

**Back Button**

1. Check that the page displays: "Back" button.
2. Verify clicking the "Back" button navigates the user back to the mnemonic confirmation page.
3. Ensure that any entered passwords are not retained when navigating back.

**Create Wallet Button**

1. Check that the page displays: Green "Create Wallet" button.
2. Verify the "Create Wallet" button is disabled if the password fields are empty or passwords do not meet requirements.
3. Ensure the "Create Wallet" button is enabled only when both password fields are filled, match, and meet the requirements.
4. Verify clicking the "Create Wallet" button with valid passwords successfully creates the wallet.
5. Ensure the user is navigated to the wallet dashboard page upon successful wallet creation.
6. Check behavior when clicking "Create Wallet" with both password fields empty.
7. Check behavior when clicking "Create Wallet" with only one of the password fields filled.

# Recover Your Wallet

1. Verify the "Recover wallet from mnemonics" page loads successfully.
2. Check that the page displays the following elements: "Back" button, "Next Step" button.
3. Check that the page displays: Input field with the note "Please put your 12-word or 24-word mnemonic" above it.
4. Ensure the input field accepts text input.
5. Verify the input field does not have a placeholder text.
6. Verify that the input field accepts exactly 12 or 24 words.
7. Ensure that any incorrect number of words (less than 12 or between 13-23 or more than 24) displays an appropriate error message.
8. Check that the input field accepts words without numbering or special formatting.
9. Ensure that extra spaces, tabs, or formatting issues prevent the acceptance of a valid phrase.
10. Verify that the system identifies and rejects invalid (inexistent) mnemonic phrases.
11. Ensure an appropriate error message is shown for invalid phrases (e.g., incorrect words, wrong number of words).
12. Ensure the system correctly identifies valid phrases without case sensitivity.

**Back Button**

1. Verify clicking the "Back" button navigates the user back to the main page.
2. Ensure that any entered mnemonic phrase is not retained when navigating back.

**Next Step Button**

1. Verify the "Next Step" button is disabled if the input field is empty or contains an incorrect number of words.
2. Ensure the "Next Step" button is enabled only when a valid 12-word or 24-word mnemonic phrase is entered.
3. Verify that clicking the "Next Step" button with a valid mnemonic phrase navigates the user to the password setup screen.
4. Ensure the password setup screen is the same as in the "Create new wallet" process.

# Import Wallet File

1. Verify the "Import wallet file" page loads successfully.
2. Ensure the "Select wallet file" button is visible and clickable.
3. Verify that clicking the button opens the file selection dialog.
4. Check that the file selection dialog allows the user to select a wallet file.
5. Ensure that only valid wallet file types can be selected (i.e., .json).
6. Ensure the "Setup password" page is visible and meets all the requirements described in the [Password Setup Page](#password-setup-page)
7. Verify the "Import wallet" button throws an error if no file is selected or password field is empty.
8. Ensure the "Import wallet" button func is enabled only when a file is selected and the password field is filled.
9. Verify that clicking the "Import wallet" button with a valid wallet file and correct password successfully imports the wallet.
10. Ensure the user is navigated to the wallet dashboard or success confirmation page upon successful wallet import.
11. Verify behavior when an invalid wallet file type is selected.
12. Ensure an appropriate error message is shown on invalid file.
13. Verify behavior when the wrong password is entered for the selected wallet file.
14. Ensure an appropriate error message is shown on the incorrect.
15. Check behavior when clicking "Import wallet" with the password field empty.
16. Ensure an appropriate error message is shown on empty password.
17. Check behavior when clicking "Import wallet" without selecting a wallet file.
18. Ensure an appropriate error message is shown on no file selection.
19. Verify behavior when the user opens the file selection dialog but cancels the selection.
20. Ensure the app correctly handles the cancellation and allows the user to retry.
21. Verify behavior when a corrupted or incomplete wallet file is selected.
22. Ensure an appropriate error message is shown for the corrupted/incomplete and the file is not processed.
23. Verify behavior when the user selects multiple files in quick succession.
24. Ensure only the last selected file is processed, or an appropriate message is shown if multiple files are not supported.
25. Verify that the system provides immediate feedback upon correct file selection.
26. Verify that the user can remove or change the selected file before entering the password.
27. Ensure the system correctly updates the file selection and resets any error messages after retrying.
28. Verify that users can cancel the file upload process if needed.
29. Ensure that any partially uploaded files are handled correctly and the user can retry.

# Log in / Log out

1. With a wallet correctly set up, and logged out, verify that navigating to any valid link `https://wallet.spacemesh.io/#/[any-existing-path]` redirects instantly to `https://wallet.spacemesh.io/#/unlock`.
2. Verify the login page loads successfully - displays the following elements: Input field to enter the password, "Unlock" button. Footer message with "Wipe out" button.
3. Ensure the password input field accepts text input.
4. Verify that the input field has the indication for password entry and that it's securely masked (dots or asteriks replace chars)
5. Check the eye icon, ensure it unmasks the password input.
6. Verify the "Unlock" button is disabled if the password field is empty.
7. Ensure the "Unlock" button is enabled when a password is entered.
8. Verify that entering the correct password and clicking the "Unlock" button logs the user in.
9. Ensure the user is navigated to the wallet overview screen upon successful login.
10. Verify that entering an incorrect password and clicking the "Unlock" button does not log the user in.
11. Ensure an appropriate error message is displayed for incorrect password attempts.
12. Verify that clicking the "Wipe out" button prompts a confirmation dialog to avoid accidental data loss.
13. Check that the confirmation dialog asks the user to confirm the wipe-out action.
14. Ensure that confirming the wipe-out action deletes the current wallet data and navigates the user to the appropriate page for creating or recovering a wallet.
15. Verify that canceling the wipe-out action keeps the current wallet data intact and returns the user to the login page.
16. Verify that the log out button is visible in the upper right corner of the wallet overview screen (currently "lock" icon).
17. Ensure the "lock" button is clickable.
18. Check that clicking the "lock" button logs the user out and redirects them to the login page.
19. Check behavior when the user's session expires: ensure the user is redirected to the login page and required to re-enter their password.
20. Verify that the password is securely transmitted and not exposed in any way.
21. Ensure the system correctly handles password encryption and validation.

# Dashboard

## Network Choice

1. Verify the network choice dropdown is visible.
2. Ensure the dropdown allows selection between Mainnet and Testnet.
3. Verify the correct network is selected and displayed after changing the network.
4. Test switching from Mainnet to Testnet and vice versa.
5. Ensure that switching networks updates the relevant account and transaction data accordingly.

## Settings Button

1. Ensure the settings button is visible and clickable.
2. Verify that clicking the settings button opens the configuration options menu.
3. Verify that each configuration option can be selected.

## Logout Button

1. Ensure the logout button is visible and clickable.
2. Verify that clicking the logout button logs the user out of the wallet session.
3. Ensure the user is redirected to the login page upon logout.

## Account Information Display

1. Verify the account name and number are displayed correctly.
2. Ensure the account name and number are updated when switching accounts.
3. Ensure the copy button is visible next to the account number.
4. Verify that clicking the copy button copies the account number to the clipboard.
5. Check that a confirmation message or indication is shown after copying.
6. Ensure the switch accounts button is visible and clickable.
7. Verify that clicking the button allows switching between multiple accounts.
8. Ensure the account information updates accordingly after switching accounts.

## Balance Display

1. Verify the account balance is displayed in a clear and readable font.
2. Ensure the balance is accurate and updates correctly after transactions.
3. Ensure the refresh button is visible next to the balance.
4. Verify that clicking the refresh button updates the balance with the most recent information.

## Send Button

1. Ensure the send button is visible.
2. Verify that clicking the send button opens a modal for inputting transaction details.

## Receive Button

1. Ensure the receive button is visible next to the send button.
2. Verify that clicking the receive button opens a modal with the active account address.
3. Verify that clicking the receive button generates a QR code.
4. Check that the QR code represents the correct account information.

## Transactions History Tab

**Overview**

1. Ensure the Transactions History tab is visible and clickable.
2. Verify that all transaction details (ID, status, sender, recipient, amount, fee, nonce, layer, epoch) match the backend data accurately.
3. Check that the transactions history shows correct and detailed information for each transaction.
4. Check that the records are clickable and open a more detailed view.
5. Ensure that each transaction includes details such as Arrow icon (left for outgoing, right for incoming, down for self-spawn transactions), Truncated transaction ID, Transaction type (spend/spawn), Date in the format: YYYY-MM-DD HH, Layer and Epoch information, Transaction amount, Transaction cost.
6. Ensure that the arrow icons are displayed correctly for each transaction type.
7. Verify that the arrow icons are orange while the transaction is being processed.
8. Ensure the arrow icons turn green once the transaction is applied/confirmed.
9. Verify that the transaction ID is truncated correctly.
10. Ensure the transaction type is correctly displayed as either "spend" or "spawn."
11. Verify that the date is displayed correctly.
12. Ensure the layer and epoch information is displayed correctly next to the date, and the values are correct.
13. Ensure the amount is formatted appropriately with the correct number of decimal places.
14. Ensure that the transaction cost is displayed correctly.
15. Verify that the tab displays an appropriate message when there are no transactions to show.
16. Verify that the transactions history loads quickly and correclty, even with a large number of transactions.
17. Ensure smooth scrolling through the list of transactions, especially with a large dataset.

 **Details**

1. Verify that clicking on a transaction row opens a sidebar showing detailed information about the transaction.
2. Ensure the sidebar loads correctly and displays all the relevant information, correct for the given transaction.
3. Ensure the full hexadecimal transaction ID is displayed correctly.
4. Check that the transaction status is displayed with the correct text (e.g., Pending, Confirmed).
5. Ensure the status color code corresponds correctly (e.g., orange for processing, green for confirmed).
6. Verify that the sender's address is displayed correctly.
7. Verify that the recipient's address is displayed correctly.
8. Ensure the nonce value is displayed correctly.
9. Verify that there are clickable explorer links next to the transaction ID, sender address, recipient address, layer, epoch and one general.
10. Check that clicking the explorer link opens the transaction details in the explorer. (all buttons work, each button leads to the given detail page)
11. Verify that there is a copy button next to the transaction ID, sender and recipient addresses.
12. Verify that clicking the copy button copies the given detail to the clipboard.
13. Check for a confirmation message or indication after copying
14. Check behavior when network issues occur while loading the transaction details.
15. Ensure the sidebar layout is clear and information is easy to read.

## Rewards History Tab

1. Ensure the Rewards History tab is visible and clickable.
2. Verify that the Rewards History tab loads successfully.
3. Check that the rewards history shows correct and detailed information for each reward.
4. Ensure that each reward entry includes details such as Date and time in the format: YYYY-MM-DD HH, Layer and Epoch information, Reward amount, Reward for layer amount, Reward for fees amount. Explorer link/button.
5. Verify that the layer and epoch information are displayed correctly next to the correct date and time.
6. Ensure that the reward amounts are displayed correctly and formatted appropriately with the correct value and number of decimal places.
7. Check that clicking the explorer link/button opens the reward details in the explorer.
8. Verify that the tab displays an appropriate message when there are no rewards to show.
9. Verify that the rewards history loads quickly, even with a large number of rewards.
10. Ensure smooth scrolling through the list of rewards, especially with a large dataset.
11. Verify that all reward details (date, layer, epoch, reward amounts) are accurately displayed as per the backend data.

# Settings

## Backup Mnemonics

1. Verify that the "Backup Mnemonics" button is visible in the settings menu.
2. Ensure the button is clearly labeled and accessible.
3. Verify that clicking the "Backup Mnemonics" button triggers a password prompt modal.
4. Confirm that the modal includes an input field for the password, an option to remember the password for 5 minutes, and two buttons: "Cancel" and "Show Mnemonics."
5. Verify that clicking the "Cancel" button closes the modal without displaying the mnemonics.
6. Ensure no sensitive information is exposed after canceling.
7. Verify that selecting the "Remember password for 5 minutes" option stores the password securely for 5 minutes.
8. Ensure that during this period, no further password prompts are required for accessing sensitive information.
9. Verify that entering an incorrect password prevents the mnemonics from being displayed.
10. Ensure that an appropriate error message is shown on incorrect password.
11. Ensure that the mnemonics are displayed correctly, either as a 12-word or 24-word seed phrase.
12. Verify that the seed phrase matches the one generated during wallet creation.
13. Verify that the "Copy" button is visible and functional.
14. Ensure that clicking the "Copy" button copies the entire mnemonic phrase to the clipboard.
15. Verify that the "OK" button is visible and functional.
16. Ensure that clicking the "OK" button or the close (cross) button in the upper-right corner closes the modal.
17. Ensure that once the modal is closed, the mnemonics are no longer accessible unless the process is repeated (with a password prompt if not within the 5-minute period).
18. 


## Export Wallet File

1. Verify that the "Export Wallet File" button is visible in the settings menu.
2. Ensure the button is clearly labeled and accessible.
3. Verify that clicking the "Export Wallet File" button immediately triggers the download of the wallet JSON file.
4. Ensure the file is saved in the user’s default download directory.
5. Confirm that the downloaded wallet file is in the correct JSON format.
6. Verify that the file contains the expected wallet data and is not corrupted.

## Wipe Out

1. Verify that the "Wipe Out" button is visible in the settings menu.
2. Ensure the button is clearly labeled and has a distinct color.
3. Verify that clicking the "Wipe Out" button triggers a modal.
4. Confirm that the modal contains two buttons: "Cancel" and "Wipe Out."
5. Verify that clicking the "Cancel" button closes the modal without performing any action.
6. Ensure the wallet data remains intact after canceling.
7. Verify that clicking the "Wipe Out" button within the modal deletes all wallet data.
8. Ensure the user is logged out and redirected to the initial setup or login page.
9. Confirm that there is no way to recover the wallet after confirming the wipe out

# Edge Cases

1. Verify that reloading the mnemonic phrase page generates a new mnemonic phrase.
2. Ensure the user is prompted to start the process again if the page is reloaded on the further steps.
3. Ensure that user confirmation is required if the page is reloaded (to prevent accidental data loss).
4. Check behavior when the session expires while on the mnemonic phrase setup steps.
5. Check behavior when the session expires while on the password setup page.
6. Ensure the user is redirected to the login/main page appropriately.
7. Verify behavior if clipboard permissions are denied.
8. Ensure an appropriate error message is displayed if clipboard access is not available.
9. Verify behavior when the network connection is lost during the tested process.
10. Check behavior under slow network conditions.
11. Ensure the system provides feedback to the user about the ongoing process (e.g., loading spinner or progress bar).

# Usability and UI/UX

1. Test the above features across different browsers (Chrome, Firefox, Safari, Edge).
2. Ensure consistent behavior and appearance across browsers.
3. Verify that the mnemonic phrase page is responsive on different screen sizes.
4. Ensure all buttons and mnemonic words are accessible and readable on mobile devices.
5. Ensure that the UI elements (buttons, grid) are consistent with the overall app design.
6. Verify that button labels are clear and understandable.
7. Check that buttons are accessible via keyboard navigation.
8. Verify the page loads quickly and performs smoothly during drag-and-drop actions.
9. Verify the page loads quickly and performs smoothly during file selection and password input.
10. Ensure no significant lag or delay is experienced.
