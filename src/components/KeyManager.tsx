import fileDownload from 'js-file-download';
import { useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
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
  IconEdit,
  IconEyeglass2,
  IconFileImport,
  IconKey,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

import useConfirmation from '../hooks/useConfirmation';
import { useCurrentHRP } from '../hooks/useNetworkSelectors';
import useRevealSecretKey from '../hooks/useRevealSecretKey';
import { useAccountsList } from '../hooks/useWalletSelectors';
import usePassword from '../store/usePassword';
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
import EditAccountModal from './EditAccountModal';
import ExplorerButton from './ExplorerButton';
import ImportAccountModal from './ImportAccountModal';
import ImportKeyFromLedgerModal from './ImportKeyFromLedgerModal';
import ImportKeyPairModal from './ImportKeyPairModal';
import RenameKeyModal from './RenameKeyModal';
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
  const { wallet, deleteKey, deleteAccount } = useWallet();
  const hrp = useCurrentHRP();
  const accounts = useAccountsList(hrp);

  const { revealSecretKey } = useRevealSecretKey();
  const { withConfirmation } = useConfirmation();
  const { withPassword } = usePassword();

  const createKeyPairModal = useDisclosure();
  const importKeyPairModal = useDisclosure();
  const renameKeyModal = useDisclosure();
  const importFromLedgerModal = useDisclosure();
  const createAccountModal = useDisclosure();
  const importAccountModal = useDisclosure();
  const editAccountModal = useDisclosure();

  const [renameKeyIdx, setRenameKeyIdx] = useState(0);
  const [editAccountIdx, setEditAccountIdx] = useState(0);

  const closeHandler = () => {
    onClose();
  };

  const onRenameKey = (idx: number) => {
    setRenameKeyIdx(idx);
    renameKeyModal.onOpen();
  };
  const onDeleteKey = (idx: number) =>
    withConfirmation(
      () =>
        withPassword(
          (pass) => deleteKey(idx, pass),
          'Delete Key',
          // eslint-disable-next-line max-len
          'Please type in the password to delete the key and store the wallet secrets without it'
        ),
      'Delete Key',
      'Are you sure you want to delete this key?',
      // eslint-disable-next-line max-len
      'You cannot undo this action, but you can always import the key again or derive it if you know the path.',
      true
    );
  const onEditAccount = (idx: number) => {
    setEditAccountIdx(idx);
    editAccountModal.onOpen();
  };
  const onDeleteAccount = (idx: number) =>
    withConfirmation(
      () =>
        withPassword(
          (pass) => deleteAccount(idx, pass),
          'Delete Account',
          // eslint-disable-next-line max-len
          'Please type in the password to delete the account and store the wallet secrets without it'
        ),
      'Delete account',
      'Are you sure you want to delete this account?',
      // eslint-disable-next-line max-len
      'You cannot undo this action, but you can always create or import the account again.',
      true
    );

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
    <Drawer size="lg" placement="right" isOpen={isOpen} onClose={closeHandler}>
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
                  {(wallet?.keychain ?? []).map((key, idx) => (
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
                          variant="ghostWhite"
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
                        <IconButton
                          ml={2}
                          aria-label="Rename key"
                          onClick={() => onRenameKey(idx)}
                          icon={<IconEdit size={12} />}
                          variant="whiteOutline"
                          borderWidth={1}
                          size="xs"
                        />
                        <IconButton
                          ml={1}
                          aria-label="Delete key"
                          onClick={() => onDeleteKey(idx)}
                          icon={<IconTrash size={12} />}
                          variant="dangerOutline"
                          borderWidth={1}
                          size="xs"
                        />
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
                  {accounts.map((acc, idx) => {
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
                          variant="ghostWhite"
                        >
                          <IconKey size={12} />
                          Export account
                        </Button>
                        <Text fontSize="md">
                          <strong>{acc.displayName}</strong>
                          <IconButton
                            ml={2}
                            aria-label="Edit account"
                            onClick={() => onEditAccount(idx)}
                            icon={<IconEdit size={12} />}
                            variant="whiteOutline"
                            borderWidth={1}
                            size="xs"
                          />
                          <IconButton
                            ml={1}
                            aria-label="Delete account"
                            onClick={() => onDeleteAccount(idx)}
                            icon={<IconTrash size={12} />}
                            variant="dangerOutline"
                            borderWidth={1}
                            size="xs"
                          />
                        </Text>
                        <Text mt={1}>
                          {acc.address}
                          <CopyButton value={acc.address} withOutline />
                          <ExplorerButton
                            dataType="accounts"
                            value={acc.address}
                            ml={1}
                          />
                        </Text>
                        <Text fontSize="md">
                          <Badge
                            fontWeight="normal"
                            fontSize="xx-small"
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
                                  (acc.spawnArguments as MultiSigSpawnArguments)
                                    .Required
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
          <RenameKeyModal
            keyIndex={renameKeyIdx ?? 0}
            isOpen={renameKeyModal.isOpen}
            onClose={renameKeyModal.onClose}
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
          <EditAccountModal
            accountIndex={editAccountIdx}
            isOpen={editAccountModal.isOpen}
            onClose={editAccountModal.onClose}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default KeyManager;
