import {
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { O } from '@mobily/ts-belt';
import {
  IconChevronDown,
  IconCircleDotted,
  IconCircleFilled,
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

  const mobile = useBreakpointValue({ base: true, md: false }) ?? true;
  return (
    <>
      <AddNetworkDrawer isOpen={isOpen} onClose={onClose} />
      <Menu>
        <MenuButton
          as={Button}
          leftIcon={
            // eslint-disable-next-line no-nested-ternary
            status?.isSynced ? (
              <IconCircleFilled size={mobile ? 8 : 14} color="#3AFFA7" />
            ) : O.isNone(currentNetwork) ? (
              <IconCircleFilled size={mobile ? 8 : 14} color="red" />
            ) : (
              <IconCircleDotted size={mobile ? 8 : 14} color="orange" />
            )
          }
          rightIcon={mobile ? <div /> : <IconChevronDown />}
          mx={[0, 2]}
          fontSize={mobile ? 'x-small' : 'sm'}
          variant="dark"
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
    </>
  );
}

export default NetworkSelection;
