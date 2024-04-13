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

import useWallet from '../store/useWallet';

import WipeOutAlert from './WipeOutAlert';

function MainMenu(): JSX.Element {
  const wipeAlert = useDisclosure();
  const { exportWalletFile } = useWallet();

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
          <MenuItem>Manage accounts</MenuItem>
          <MenuItem>Backup mnemonic</MenuItem>
          <MenuItem onClick={exportWalletFile}>Export wallet file</MenuItem>
          <MenuDivider />
          <MenuItem>Manage networks</MenuItem>
          <MenuDivider />
          <MenuItem color="red" onClick={wipeAlert.onOpen}>
            Wipe out
          </MenuItem>
        </MenuList>
      </Menu>
      <WipeOutAlert disclosure={wipeAlert} />
    </>
  );
}

export default MainMenu;
