import { useState } from 'react';

import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Portal,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  IconDeviceUsb,
  IconFileImport,
  IconKey,
  IconPlus,
} from '@tabler/icons-react';

import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import { KeyPairType, SafeKey } from '../types/wallet';
import { BUTTON_ICON_SIZE } from '../utils/constants';
import { getTemplateNameByKey } from '../utils/templates';

import CopyButton from './CopyButton';
import CreateKeyPairModal from './CreateKeyPairModal';
import ImportKeyPairModal from './ImportKeyPairModal copy';
import RevealSecretKeyModal from './RevealSecretKeyModal';

type KeyManagerProps = {
  isOpen: boolean;
  onClose: () => void;
};

function KeyManager({ isOpen, onClose }: KeyManagerProps): JSX.Element {
  const [revealed, setRevealed] = useState({ displayName: '', secretKey: '' });
  const { wallet, listAccounts, revealSecretKey } = useWallet();
  const { withPassword } = usePassword();

  const createKeyPairModal = useDisclosure();
  const importKeyPairModal = useDisclosure();
  const revealSecretKeyModal = useDisclosure();

  const accounts = listAccounts();

  const closeHandler = () => {
    onClose();
  };
  const onRevealSecretModalCloseHandler = () => {
    setRevealed({ displayName: '', secretKey: '' });
    revealSecretKeyModal.onClose();
  };

  const exportSecretKey = (key: SafeKey) => async () => {
    const sk = await withPassword(
      (password) => revealSecretKey(key.publicKey, password),
      'Reveal secret key',
      // eslint-disable-next-line max-len
      `Please type the password to reveal secret key for account "${key.displayName}"`
    );
    if (sk) {
      setRevealed({
        displayName: key.displayName,
        secretKey: sk,
      });
      revealSecretKeyModal.onOpen();
    }
  };

  return (
    <>
      <Portal>
        <Drawer
          size="lg"
          placement="right"
          isOpen={isOpen}
          onClose={closeHandler}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton zIndex={2} />
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
                <TabPanels
                  display="flex"
                  flex={1}
                  flexDir="column"
                  fontSize="sm"
                >
                  <TabPanel display="flex" flexDir="column">
                    <Box mb={4}>
                      <ButtonGroup size="sm" spacing={2}>
                        <Button onClick={createKeyPairModal.onOpen}>
                          <IconPlus size={BUTTON_ICON_SIZE} />
                          <Text as="span" ml={1}>
                            Create new key
                          </Text>
                        </Button>
                        <Button onClick={importKeyPairModal.onOpen}>
                          <IconFileImport size={BUTTON_ICON_SIZE} />
                          <Text as="span" ml={1}>
                            Import key
                          </Text>
                        </Button>
                      </ButtonGroup>
                    </Box>
                    <Box flex={1} overflow="scroll">
                      {(wallet?.keychain ?? []).map((key) => (
                        <Box
                          key={key.publicKey}
                          mb={2}
                          p={2}
                          backgroundColor="blackAlpha.300"
                          borderRadius="md"
                        >
                          {key.type === KeyPairType.Software ? (
                            <Button
                              size="xx-small"
                              p={1}
                              fontSize="xx-small"
                              fontWeight="normal"
                              float="right"
                              display="flex"
                              alignItems="center"
                              borderRadius="sm"
                              textTransform="uppercase"
                              gap={1}
                              onClick={exportSecretKey(key)}
                            >
                              <IconKey size={12} />
                              Export secret key
                            </Button>
                          ) : (
                            <Badge
                              p={1}
                              fontSize="xx-small"
                              fontWeight="normal"
                              float="right"
                              display="flex"
                              alignItems="center"
                              colorScheme="yellow"
                              gap={1}
                            >
                              <IconDeviceUsb size={12} />
                              Hardware
                            </Badge>
                          )}
                          <Text fontWeight="bold" mb={1}>
                            {key.displayName}
                          </Text>

                          <Text fontSize="xx-small">Public Key</Text>
                          <Flex>
                            <Text flex={1} style={{ lineBreak: 'anywhere' }}>
                              0x{key.publicKey}
                            </Text>
                            <CopyButton value={`0x${key.publicKey}`} />
                          </Flex>
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
      <CreateKeyPairModal
        isOpen={createKeyPairModal.isOpen}
        onClose={createKeyPairModal.onClose}
      />
      <ImportKeyPairModal
        isOpen={importKeyPairModal.isOpen}
        onClose={importKeyPairModal.onClose}
        keys={(wallet?.keychain ?? []).map((k) => k.publicKey)}
      />
      <RevealSecretKeyModal
        displayName={revealed.displayName}
        secretKey={revealed.secretKey}
        isOpen={revealSecretKeyModal.isOpen}
        onClose={onRevealSecretModalCloseHandler}
      />
    </>
  );
}

export default KeyManager;
