import fileDownload from 'js-file-download';

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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  ThemingProps,
  useDisclosure,
} from '@chakra-ui/react';
import { StdPublicKeys } from '@spacemesh/sm-codec';
import {
  IconDeviceDesktop,
  IconDeviceUsb,
  IconEyeglass2,
  IconFileImport,
  IconKey,
  IconPlus,
} from '@tabler/icons-react';

import { useCurrentHRP } from '../hooks/useNetworkSelectors';
import useRevealSecretKey from '../hooks/useRevealSecretKey';
import { useAccountsList } from '../hooks/useWalletSelectors';
import useWallet from '../store/useWallet';
import {
  AccountWithAddress,
  KeyPairType,
  SafeKeyWithType,
} from '../types/wallet';
import { BUTTON_ICON_SIZE } from '../utils/constants';
import {
  AnySpawnArguments,
  getTemplateNameByKey,
  MultiSigSpawnArguments,
  SingleSigSpawnArguments,
  VaultSpawnArguments,
} from '../utils/templates';
import { safeKeyForAccount } from '../utils/wallet';

import CopyButton from './CopyButton';
import CreateAccountModal from './CreateAccountModal';
import CreateKeyPairModal from './CreateKeyPairModal';
import ExplorerButton from './ExplorerButton';
import ImportAccountModal from './ImportAccountModal';
import ImportKeyFromLedgerModal from './ImportKeyFromLedgerModal';
import ImportKeyPairModal from './ImportKeyPairModal';
import RevealSecretKeyModal from './RevealSecretKeyModal';

type KeyManagerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const getTemplateColorByKey = (key: string): ThemingProps['colorScheme'] => {
  switch (key) {
    case StdPublicKeys.MultiSig:
      return 'orange';
    case StdPublicKeys.Vault:
      return 'pink';
    case StdPublicKeys.Vesting:
      return 'purple';
    case StdPublicKeys.SingleSig:
    default:
      return 'green';
  }
};

const renderSingleKey = (key: SafeKeyWithType): JSX.Element =>
  key.type === KeyPairType.Software ? (
    <>
      <IconDeviceDesktop size={10} />
      <Text as="span" ml={1}>
        Local Key
      </Text>
    </>
  ) : (
    <>
      <IconDeviceUsb size={10} />
      <Text as="span" ml={1}>
        Hardware
      </Text>
    </>
  );

function KeyManager({ isOpen, onClose }: KeyManagerProps): JSX.Element {
  const { wallet } = useWallet();
  const hrp = useCurrentHRP();
  const accounts = useAccountsList(hrp);

  const { revealSecretKey } = useRevealSecretKey();

  const createKeyPairModal = useDisclosure();
  const importKeyPairModal = useDisclosure();
  const importFromLedgerModal = useDisclosure();
  const createAccountModal = useDisclosure();
  const importAccountModal = useDisclosure();

  const closeHandler = () => {
    onClose();
  };

  const exportAccount = (acc: AccountWithAddress) =>
    fileDownload(
      JSON.stringify(acc, null, 2),
      `${acc.address}.account`,
      'text/plain'
    );

  const getKeysByAccount = (acc: AccountWithAddress) => {
    switch (acc.templateAddress) {
      case StdPublicKeys.SingleSig: {
        const pk = (acc.spawnArguments as SingleSigSpawnArguments).PublicKey;
        return (wallet?.keychain ?? []).filter((k) => k.publicKey === pk);
      }
      case StdPublicKeys.MultiSig:
      case StdPublicKeys.Vesting: {
        const pks = (acc.spawnArguments as MultiSigSpawnArguments).PublicKeys;
        return (wallet?.keychain ?? []).filter((k) =>
          pks.includes(k.publicKey)
        );
      }
      case StdPublicKeys.Vault: {
        const pk = (acc.spawnArguments as VaultSpawnArguments).Owner;
        return (wallet?.keychain ?? []).filter((k) => k.publicKey === pk);
      }
      default: {
        throw new Error('Unknown account type');
      }
    }
  };

  const withoutInitialUnlockAmount = (args: AnySpawnArguments) => {
    if (Object.hasOwn(args, 'InitialUnlockAmount')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { InitialUnlockAmount, ...rest } = args as VaultSpawnArguments;
      return rest;
    }
    return args;
  };

  return (
    <>
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
              <TabPanels display="flex" flex={1} flexDir="column" fontSize="sm">
                <TabPanel display="flex" flexDir="column">
                  <Flex mb={4} gap={2} flexDir={['column', 'row']}>
                    <Button
                      onClick={createKeyPairModal.onOpen}
                      variant="white"
                      size="sm"
                    >
                      <IconPlus size={BUTTON_ICON_SIZE} />
                      <Text as="span" ml={1}>
                        Create new key
                      </Text>
                    </Button>
                    <Button
                      onClick={importFromLedgerModal.onOpen}
                      variant="white"
                      size="sm"
                    >
                      <IconDeviceUsb size={BUTTON_ICON_SIZE} />
                      <Text as="span" ml={1}>
                        Import from Ledger
                      </Text>
                    </Button>
                    <Button
                      onClick={importKeyPairModal.onOpen}
                      variant="white"
                      size="sm"
                    >
                      <IconFileImport size={BUTTON_ICON_SIZE} />
                      <Text as="span" ml={1}>
                        Import secret key
                      </Text>
                    </Button>
                  </Flex>
                  <Box flex={1}>
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
                            onClick={() => revealSecretKey(key)}
                            variant="dark"
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
                <TabPanel display="flex" flexDir="column">
                  <Flex mb={4} gap={2} flexDir={['column', 'row']}>
                    <Button
                      onClick={createAccountModal.onOpen}
                      variant="white"
                      size="sm"
                    >
                      <IconPlus size={BUTTON_ICON_SIZE} />
                      <Text as="span" ml={1}>
                        Create new account
                      </Text>
                    </Button>
                    <Button
                      onClick={importAccountModal.onOpen}
                      variant="white"
                      size="sm"
                    >
                      <IconFileImport size={BUTTON_ICON_SIZE} />
                      <Text as="span" ml={1}>
                        Import account
                      </Text>
                    </Button>
                  </Flex>
                  <Box flex={1}>
                    {accounts.map((acc) => {
                      const keys = getKeysByAccount(acc);
                      return (
                        <Box
                          key={safeKeyForAccount(acc)}
                          mb={2}
                          p={2}
                          backgroundColor="blackAlpha.300"
                          borderRadius="md"
                        >
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
                            onClick={() => exportAccount(acc)}
                            variant="dark"
                          >
                            <IconKey size={12} />
                            Export account
                          </Button>
                          <Text fontSize="md">
                            <strong>{acc.displayName}</strong>
                            <Badge
                              fontWeight="normal"
                              fontSize="xx-small"
                              ml={1}
                              colorScheme={getTemplateColorByKey(
                                acc.templateAddress
                              )}
                            >
                              {getTemplateNameByKey(acc.templateAddress)}
                            </Badge>
                            <Badge
                              display="inline-flex"
                              alignItems="center"
                              fontWeight="normal"
                              fontSize="xx-small"
                              ml={1}
                              colorScheme="yellow"
                            >
                              {keys.length === 1 &&
                                keys[0] &&
                                renderSingleKey(keys[0])}
                              {
                                /* eslint-disable max-len */
                                keys.length > 1 &&
                                  `${keys.length} / ${
                                    (
                                      acc.spawnArguments as MultiSigSpawnArguments
                                    ).Required
                                  } keys`
                                /* eslint-enable max-len */
                              }
                              {keys.length === 0 && (
                                <>
                                  <IconEyeglass2 size={10} />
                                  <Text as="span" ml={1}>
                                    View-only
                                  </Text>
                                </>
                              )}
                            </Badge>
                          </Text>
                          <Text mb={4}>
                            {acc.address}
                            <CopyButton value={acc.address} />
                            <ExplorerButton
                              dataType="accounts"
                              value={acc.address}
                              ml={1}
                            />
                          </Text>

                          <Box color="grey">
                            {Object.entries(
                              withoutInitialUnlockAmount(acc.spawnArguments)
                            ).map(([k, v]) => (
                              <Box
                                key={`${safeKeyForAccount(acc)}_${k}_wtf`}
                                mt={1}
                                fontSize="xx-small"
                                wordBreak="break-all"
                              >
                                {k}: {JSON.stringify(v)}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <CreateKeyPairModal
        isOpen={createKeyPairModal.isOpen}
        onClose={createKeyPairModal.onClose}
      />
      <ImportKeyPairModal
        isOpen={importKeyPairModal.isOpen}
        onClose={importKeyPairModal.onClose}
        keys={(wallet?.keychain ?? []).map((k) => k.publicKey)}
      />
      <ImportKeyFromLedgerModal
        isOpen={importFromLedgerModal.isOpen}
        onClose={importFromLedgerModal.onClose}
      />
      <RevealSecretKeyModal />
      <CreateAccountModal
        isOpen={createAccountModal.isOpen}
        onClose={createAccountModal.onClose}
      />
      <ImportAccountModal
        accounts={accounts}
        isOpen={importAccountModal.isOpen}
        onClose={importAccountModal.onClose}
      />
    </>
  );
}

export default KeyManager;
