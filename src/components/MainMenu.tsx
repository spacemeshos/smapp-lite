import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { IconMenu2 } from '@tabler/icons-react';

function MainMenu(): JSX.Element {
  return (
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
        <MenuDivider />
        <MenuItem>Manage networks</MenuItem>
        <MenuDivider />
        <MenuItem color="red">Wipe out</MenuItem>
      </MenuList>
    </Menu>
  );
}

export default MainMenu;
