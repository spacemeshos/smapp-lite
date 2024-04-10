import {
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react';
import { IconChevronDown, IconWorldSearch } from '@tabler/icons-react';

import useNetworks from '../store/useNetworks';

import AddNetworkDrawer from './AddNetworkDrawer';

function NetworkSelection(): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { getCurrentNetwork, networks } = useNetworks();
  const currentNetwork = getCurrentNetwork();

  return (
    <>
      <AddNetworkDrawer isOpen={isOpen} onClose={onClose} />
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
          <MenuItem onClick={onOpen}>Add new network...</MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}

export default NetworkSelection;
