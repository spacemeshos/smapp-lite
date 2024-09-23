import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { IconSettings } from '@tabler/icons-react';

import useMnemonics from '../hooks/useMnemonics';
import useWallet from '../store/useWallet';
import { MAIN_MENU_BUTTONS_SIZE } from '../utils/constants';

import KeyManager from './KeyManager';
import MnemonicsModal from './MnemonicsModal';
import VerifyMessageModal from './VerifyMessageModal';
import WipeOutAlert from './WipeOutAlert';

function MainMenu(): JSX.Element {
  const { exportWalletFile } = useWallet();

  const wipeAlert = useDisclosure();

  const keyManagerDrawer = useDisclosure();
  const verifyMessageModal = useDisclosure();
  const { revealMnemonics } = useMnemonics();
  const iconSize = useBreakpointValue(MAIN_MENU_BUTTONS_SIZE, { ssr: false });

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Settings"
          icon={<IconSettings size={iconSize} />}
          size="sm"
          variant="ghostWhite"
          m={{ base: 0, md: 2 }}
          p={{ base: 0, md: 2 }}
        />
        <MenuList>
          <MenuItem onClick={keyManagerDrawer.onOpen}>
            Manage keys & accounts
          </MenuItem>
          <MenuItem onClick={revealMnemonics}>Backup mnemonic</MenuItem>
          <MenuItem onClick={exportWalletFile}>Export wallet file</MenuItem>
          <MenuDivider />
          <MenuItem onClick={verifyMessageModal.onOpen}>
            Verify Message
          </MenuItem>
          <MenuDivider />
          <MenuItem color="red" onClick={wipeAlert.onOpen}>
            Wipe out
          </MenuItem>
        </MenuList>
      </Menu>
      <WipeOutAlert disclosure={wipeAlert} />
      <MnemonicsModal />
      <KeyManager
        isOpen={keyManagerDrawer.isOpen}
        onClose={keyManagerDrawer.onClose}
      />
      <VerifyMessageModal
        isOpen={verifyMessageModal.isOpen}
        onClose={verifyMessageModal.onClose}
      />
    </>
  );
}

export default MainMenu;
