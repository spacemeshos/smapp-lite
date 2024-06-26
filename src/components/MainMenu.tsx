import { useState } from 'react';

import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react';
import { IconMenu2 } from '@tabler/icons-react';

import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';

import KeyManager from './KeyManager';
import MnemonicsModal from './MnemonicsModal';
import WipeOutAlert from './WipeOutAlert';

function MainMenu(): JSX.Element {
  const { exportWalletFile, showMnemonics } = useWallet();
  const { withPassword } = usePassword();

  const wipeAlert = useDisclosure();

  const mnemonicsModal = useDisclosure();
  const keyManagerDrawer = useDisclosure();
  const [mnemonics, setMnemonics] = useState('');
  const onMnemonicsClose = () => {
    setMnemonics('');
    mnemonicsModal.onClose();
  };

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Settings"
          icon={<IconMenu2 />}
          fontSize="sm"
        />
        <MenuList>
          <MenuItem onClick={keyManagerDrawer.onOpen}>
            Manage keys & accounts
          </MenuItem>
          <MenuItem
            onClick={async () => {
              const words = await withPassword(
                showMnemonics,
                'Show mnemonics',
                // eslint-disable-next-line max-len
                'Please enter your password to read mnemonics from the secret part of your wallet:'
              );
              if (words) {
                setMnemonics(words);
                mnemonicsModal.onOpen();
              }
            }}
          >
            Backup mnemonic
          </MenuItem>
          <MenuItem onClick={exportWalletFile}>Export wallet file</MenuItem>
          <MenuDivider />
          <MenuItem color="red" onClick={wipeAlert.onOpen}>
            Wipe out
          </MenuItem>
        </MenuList>
      </Menu>
      <WipeOutAlert disclosure={wipeAlert} />
      <MnemonicsModal
        isOpen={mnemonicsModal.isOpen}
        onClose={onMnemonicsClose}
        mnemonics={mnemonics}
      />
      <KeyManager
        isOpen={keyManagerDrawer.isOpen}
        onClose={keyManagerDrawer.onClose}
      />
    </>
  );
}

export default MainMenu;
