import { Fragment, useState } from 'react';

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  IconButton,
  List,
  ListItem,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { IconEdit, IconPointFilled, IconTrash } from '@tabler/icons-react';

import useConfirmation from '../hooks/useConfirmation';
import useNetworks from '../store/useNetworks';
import { Network } from '../types/networks';
import { BUTTON_ICON_SIZE } from '../utils/constants';
import { formatTimestamp } from '../utils/datetime';
import DEFAULT_NETWORKS from '../utils/defaultNetworks';

import AddNetworkDrawer from './AddNetworkDrawer';
import EditOneNetworkDrawer from './EditOneNetworkDrawer';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const isDefaultNetwork = (net: Network) => DEFAULT_NETWORKS.includes(net);

function EditNetworksDrawer({ isOpen, onClose }: Props): JSX.Element {
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const { deleteNetwork, networks } = useNetworks();
  const editNetDrawer = useDisclosure();
  const drawerAdd = useDisclosure();
  const { withConfirmation } = useConfirmation();

  const onEdit = (idx: number) => {
    setSelectedNetwork(idx);
    editNetDrawer.onOpen();
  };
  const onDelete = (idx: number) => {
    const network = networks[idx];
    if (!network) {
      throw new Error(
        `Cannot delete the network (id: ${idx}) that is not exist`
      );
    }
    withConfirmation(
      () => deleteNetwork(idx),
      'Delete network',
      'Are you sure you want to delete this network?',
      <>
        <List spacing={2}>
          <ListItem>
            <Text fontSize="xs">Network name:</Text>
            {network.name}
          </ListItem>
          <ListItem>
            <Text fontSize="xs">JSON RPC URL:</Text>
            {network.jsonRPC}
          </ListItem>
          <ListItem>
            <Text fontSize="xs">Genesis ID:</Text>
            {network.genesisID}
          </ListItem>
          <ListItem>
            <Text fontSize="xs">Genesis Time:</Text>
            {formatTimestamp(network.genesisTime)}
            <Text fontSize="xx-small">UNIX Time: {network.genesisTime}</Text>
          </ListItem>
        </List>
        <Text fontSize="xs" color="brand.gray" mt={4}>
          You cannot undo this action but can always add the network again.
        </Text>
      </>
    );
  };

  const firstNonDefaultNetwork = networks.findIndex(
    (net) => !isDefaultNetwork(net)
  );

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Edit networks</DrawerHeader>
        <DrawerBody>
          <AddNetworkDrawer
            isOpen={drawerAdd.isOpen}
            onClose={drawerAdd.onClose}
          />
          <EditOneNetworkDrawer
            idx={selectedNetwork}
            isOpen={editNetDrawer.isOpen}
            onClose={editNetDrawer.onClose}
          />
          <List cursor="default" userSelect="none">
            {networks.map((net, idx) => (
              <Fragment key={`network-${net.name}-${net.jsonRPC}`}>
                {firstNonDefaultNetwork === idx && (
                  <ListItem
                    display="flex"
                    alignItems="center"
                    key="non-defaults"
                  >
                    <Text fontSize="xs" color="brand.gray" my={2}>
                      You cannot edit or delete default networks, but you may
                      create, edit, and delete custom ones.
                    </Text>
                  </ListItem>
                )}
                <ListItem
                  display="flex"
                  alignItems="center"
                  mx={-2}
                  pl={2}
                  _hover={{
                    borderRadius: 'lg',
                    bgColor: 'blackAlpha.100',
                  }}
                >
                  <Icon as={IconPointFilled} mr={2} size={BUTTON_ICON_SIZE} />
                  <Text flexGrow={1} textAlign="left">
                    {net.name}
                  </Text>
                  <IconButton
                    aria-label="Edit network"
                    icon={<IconEdit size={BUTTON_ICON_SIZE} />}
                    onClick={() => onEdit(idx)}
                    variant="ghost"
                    isDisabled={isDefaultNetwork(net)}
                  />
                  <IconButton
                    aria-label="Delete network"
                    icon={<IconTrash size={BUTTON_ICON_SIZE} />}
                    onClick={() => onDelete(idx)}
                    variant="ghostRed"
                    isDisabled={isDefaultNetwork(net)}
                  />
                </ListItem>
              </Fragment>
            ))}
          </List>
        </DrawerBody>
        <DrawerFooter>
          <Button w="100%" variant="green" onClick={drawerAdd.onOpen}>
            Add new network...
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default EditNetworksDrawer;
