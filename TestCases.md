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
5. Verify the presence of a "Back" button.
6. Verify the presence of a "Next Step" button.
7. Verify that the 4 missing words can be dragged and dropped into the empty slots on the grid.
8. Ensure that each word can only be placed in one slot.
9. Ensure that only one word can be placed in one slot at a time. If there was already a word, it should pop out to the initial top position above the grid.
10. Check that a word, once placed, remains in the slot unless dragged out again.
11. Ensure the user can easily drag the word out of the incorrect slot and try again.
12. Verify that correctly placing the words into their slots provides visual feedback.
13. Ensure that an error message or visual indication is provided if the words are placed in the wrong slots.

**Back button**

1. Verify that clicking "Back" navigates the user back to the mnemonic phrase page.
2. Ensure that the mnemonic phrase is retained when returning to the mnemonic phrase page.
3. Ensure that clicking 'Back' clears all filled words and prompts the user to fill in the 4 words again.

**Next step button**

1. Verify that clicking "Next Step" is only enabled when all 4 words are correctly placed in the grid.
2. Ensure that clicking "Next Step" navigates the user to the next page i.e. password setup.
3. Check behavior when attempting to click "Next Step" with only some of the words correctly placed.
4. Ensure that clicking 'Next Step' clears all filled words and prompts the user to fill in the 4 words again.


## Password Setup Page

1. Verify the password setup page loads successfully.
2. Ensure the "Set the password:" input field is visible and accepts input.
3. Ensure the "Confirm the password:" input field is visible and accepts input.
4. Verify that by default input is hidden and replaced by "*".
5. Check that the page displays eye icon buttons for both input fields.
6. Check that both input fields have the placeholder text "Enter password".
7. Check that the page displays: "Back" button.
8. Check that the page displays: Green "Create Wallet" button.
9. Verify clicking the eye icon reveals the entered password in the "Set the password:" field.
10. Verify clicking the eye icon reveals the entered password in the "Confirm the password:" field.
11. Ensure clicking the eye icon again hides the password.
12. Verify that the "Confirm the password:" field must match the "Set the password:" field.
13. Verify an appropriate error message is shown if the passwords in the "Set the password" and "Confirm the password" fields do not match.
14. Verify the system correctly handles and accepts special characters in the password fields.
15. Verify that the password is securely transmitted and not exposed in any way.
16. Ensure the app correctly handles password encryption and validation.

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

1. Verify clicking the "Back" button navigates the user back to the mnemonic confirmation page.
2. Ensure that any entered passwords are not retained when navigating back.

**Create Wallet Button**

1. Verify the "Create Wallet" button is disabled if the password fields are empty or passwords do not meet requirements.
2. Ensure the "Create Wallet" button is enabled only when both password fields are filled, match, and meet the requirements.
3. Verify clicking the "Create Wallet" button with valid passwords successfully creates the wallet.
4. Ensure the user is navigated to the wallet dashboard page upon successful wallet creation.
5. Check behavior when clicking "Create Wallet" with both password fields empty.
6. Check behavior when clicking "Create Wallet" with only one of the password fields filled.

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
