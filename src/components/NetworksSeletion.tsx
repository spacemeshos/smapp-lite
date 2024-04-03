import {
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { IconChevronDown, IconWorldSearch } from '@tabler/icons-react';

import useNetworks from '../store/useNetworks';

function NetworkSelection(): JSX.Element {
  const { getCurrentNetwork, networks } = useNetworks();
  const currentNetwork = getCurrentNetwork();

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<IconChevronDown />} fontSize="sm">
        {currentNetwork === null ? 'No network' : currentNetwork.name}
      </MenuButton>
      <MenuList>
        {networks.map((val) => (
          <MenuItem key={val.jsonRPC}>
            {val.name}
            <Button>
              <IconWorldSearch />
            </Button>
          </MenuItem>
        ))}
        <MenuDivider />
        <MenuItem>Add new network...</MenuItem>
      </MenuList>
    </Menu>
  );
}

export default NetworkSelection;
