import { useMemo, useState } from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Portal,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import { AnyKey } from '../types/wallet';
import { isLocalKey } from '../utils/keys';
import { getTemplateNameByKey } from '../utils/templates';

import CopyButton from './CopyButton';

type KeyManagerProps = {
  isOpen: boolean;
  onClose: () => void;
};

function KeyManager({ isOpen, onClose }: KeyManagerProps): JSX.Element {
  const { listKeys, listSecretKeys, listAccounts } = useWallet();
  const { withPassword } = usePassword();
  const pubKeys = useMemo(listKeys, [listKeys]);
  const [keys, setKeys] = useState<AnyKey[]>(pubKeys);
  const [isSecretsRevealed, setIsSecretsRevealed] = useState(false);

  const accounts = listAccounts();

  const toggleSecrets = async () => {
    if (isSecretsRevealed) {
      setKeys(pubKeys);
      setIsSecretsRevealed(false);
      return;
    }
    const secrets = await withPassword(
      listSecretKeys,
      'Reveal secrets',
      // eslint-disable-next-line max-len
      'Please enter the password to reveal secrets. Remember to keep them private and not share to anyone!'
    );
    if (secrets) {
      setKeys(secrets);
      setIsSecretsRevealed(true);
    }
  };

  const closeHandler = () => {
    setKeys(pubKeys);
    setIsSecretsRevealed(false);
    onClose();
  };

  return (
    <Portal>
      <Drawer
        size="lg"
        placement="right"
        isOpen={isOpen}
        onClose={closeHandler}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <Tabs
              w="100%"
              display="flex"
              flexGrow={1}
              flexDirection="column"
              colorScheme="green"
              position="relative"
            >
              <TabList h={14}>
                <Tab>Keys</Tab>
                <Tab>Accounts</Tab>
              </TabList>
              <TabPanels display="flex" flex={1} flexDir="column" fontSize="sm">
                <TabPanel display="flex" flexDir="column">
                  <Box mb={4}>
                    <Button onClick={toggleSecrets} float="right">
                      {isSecretsRevealed ? (
                        <IconEyeOff size={12} />
                      ) : (
                        <IconEye size={12} />
                      )}
                      <Text as="span" ml={1}>
                        {isSecretsRevealed ? 'Hide secrets' : 'Reveal secrets'}
                      </Text>
                    </Button>
                    <ButtonGroup size="md" spacing={2}>
                      <Button>Create new key</Button>
                      <Button>Import key</Button>
                    </ButtonGroup>
                  </Box>
                  <Box flex={1} overflow="scroll">
                    {keys.map((key) => (
                      <Box key={key.publicKey} mb={4}>
                        <Text>{key.displayName}</Text>
                        <Text fontSize="xs" mb={1}>
                          {key.created}
                        </Text>

                        <Text fontSize="xs">Public Key</Text>
                        <Text>
                          {key.publicKey}
                          <CopyButton value={key.publicKey} />
                        </Text>

                        {isLocalKey(key) && (
                          <>
                            <Text fontSize="xs">Secret Key</Text>
                            <Text>
                              {key.secretKey}
                              <CopyButton value={key.secretKey} />
                            </Text>
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>
                </TabPanel>
                <TabPanel>
                  {accounts.map((acc) => (
                    <Box key={acc.address} mb={4}>
                      <Text fontSize="xs">{acc.displayName}</Text>
                      <Text mb={1}>
                        {acc.address}
                        <CopyButton value={acc.address} />
                      </Text>

                      <Text fontSize="xs">Template Type</Text>
                      <Text>{getTemplateNameByKey(acc.templateAddress)}</Text>

                      <Text fontSize="xs">Spawn Arguments</Text>
                      <Text as="pre" fontSize="xs" overflow="scroll">
                        {JSON.stringify(acc.spawnArguments, null, 2)}
                      </Text>
                    </Box>
                  ))}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Portal>
  );
}

export default KeyManager;
