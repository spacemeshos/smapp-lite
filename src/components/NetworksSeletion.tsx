import {
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react';
import { O } from '@mobily/ts-belt';
import {
  IconChevronDown,
  IconCircleDotted,
  IconCircleFilled,
  IconWorldSearch,
} from '@tabler/icons-react';

import useNetworks from '../store/useNetworks';
import useNetworkStatus from '../store/useNetworkStatus';

import AddNetworkDrawer from './AddNetworkDrawer';

function NetworkSelection(): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedIndex, getCurrentNetwork, switchNetwork, networks } =
    useNetworks();
  const currentNetwork = getCurrentNetwork();
  const { status } = useNetworkStatus();

  return (
    <>
      <AddNetworkDrawer isOpen={isOpen} onClose={onClose} />
      <Menu>
        <MenuButton
          as={Button}
          leftIcon={
            status?.isSynced ? (
              <IconCircleFilled size={14} color="green" />
            ) : (
              <IconCircleDotted size={14} color="orange" />
            )
          }
          rightIcon={<IconChevronDown />}
          fontSize="sm"
        >
          {O.mapWithDefault(currentNetwork, 'No network', (net) => net.name)}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup
            type="radio"
            value={String(selectedIndex)}
            onChange={(val) =>
              typeof val === 'string' && switchNetwork(parseInt(val, 10))
            }
          >
            {networks.map((val, idx) => (
              <MenuItemOption
                value={String(idx)}
                key={`${val.name}_${val.jsonRPC}`}
              >
                {val.name}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuItem onClick={onOpen}>Add new network...</MenuItem>
        </MenuList>
      </Menu>
      <Button
        as="a"
        href={currentNetwork?.explorerUrl}
        target="_blank"
        disabled={!currentNetwork}
        cursor={!currentNetwork ? 'not-allowed' : 'pointer'}
        ml={2}
      >
        <IconWorldSearch color={!currentNetwork ? 'grey' : undefined} />
      </Button>
      <Spacer />
    </>
  );
}

export default NetworkSelection;
