import { useState } from 'react';
import QRCode from 'react-qr-code';

import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

import useCopy from '../hooks/useCopy';
import { useIsLedgerAccount } from '../hooks/useWalletSelectors';
import useHardwareWallet, {
  VerificationStatus,
} from '../store/useHardwareWallet';
import useWallet from '../store/useWallet';
import { AccountWithAddress } from '../types/wallet';
import {
  isMultiSigAccount,
  isSingleSigAccount,
  isVestingAccount,
} from '../utils/account';

import CopyButton from './CopyButton';

type ReceiveModalProps = {
  account: AccountWithAddress;
  isOpen: boolean;
  onClose: () => void;
};

function ReceiveModal({
  account,
  isOpen,
  onClose,
}: ReceiveModalProps): JSX.Element {
  const { isCopied, onCopy } = useCopy();
  const isLedgerBasedAccount = useIsLedgerAccount();
  const { wallet } = useWallet();
  const { checkDeviceConnection, connectedDevice } = useHardwareWallet();

  const [verificationError, setVerificationError] = useState<Error | null>(
    null
  );
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  const verify = async (): Promise<VerificationStatus> => {
    if (!wallet || !(await checkDeviceConnection()) || !connectedDevice) {
      return VerificationStatus.NotConnected;
    }
    if (isSingleSigAccount(account)) {
      const key = wallet.keychain.find(
        (k) => k.publicKey === account.spawnArguments.PublicKey
      );
      if (!key || !key.path) {
        throw new Error('Key not found');
      }
      return connectedDevice.actions.verify(key.path, account);
    }
    if (isMultiSigAccount(account) || isVestingAccount(account)) {
      const keyIndex = wallet.keychain.findIndex((k) =>
        account.spawnArguments.PublicKeys.includes(k.publicKey)
      );
      const key = wallet.keychain[keyIndex];
      if (!key || !key.path) {
        throw new Error('Key not found');
      }
      return connectedDevice.actions.verify(key.path, account, keyIndex);
    }
    throw new Error('Unknown account type');
  };

  const close = () => {
    if (verificationStatus !== VerificationStatus.Pending) {
      setVerificationError(null);
      setVerificationStatus(null);

      onClose();
    }
  };

  const verifyAndShow = () => {
    // Show "verify on device" message
    setVerificationStatus(VerificationStatus.Pending);
    // Reset errors
    setVerificationError(null);
    // Verify the address
    verify()
      .then((res) => {
        setVerificationStatus(res);
      })
      .catch((err) => {
        setVerificationStatus(null);
        setVerificationError(err);
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        {verificationStatus !== VerificationStatus.Pending && (
          <ModalCloseButton />
        )}
        <ModalHeader textAlign="center">Receive funds</ModalHeader>
        <ModalBody>
          <Text fontSize="sm" mb={4} textAlign="center">
            {account.address}
            <CopyButton value={account.address} />
          </Text>
          <QRCode
            bgColor="var(--chakra-colors-brand-lightGray)"
            fgColor="var(--chakra-colors-blackAlpha-500)"
            style={{
              height: 'auto',
              maxWidth: '300px',
              width: '100%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            value={account.address}
          />
          <Box my={2} minH={42} fontSize="sm" textAlign="center">
            {verificationStatus === VerificationStatus.ApprovedCorrect && (
              <Text color="brand.green">
                The address is verified successfully!
              </Text>
            )}
            {verificationStatus === VerificationStatus.Pending && (
              <Text color="yellow">
                Please review the address on the Ledger device.
                <br />
                Approve if it matches the address above.
              </Text>
            )}
            {verificationStatus === VerificationStatus.NotConnected && (
              <Text color="yellow">
                The ledger device is not connected.
                <br />
                Please connect the device and then click &quot;Verify&quot;
                button once again.
              </Text>
            )}
            {verificationStatus === VerificationStatus.ApprovedWrong && (
              <Text color="brand.red">
                The address is incorrect, probably you are using another Ledger
                device.
              </Text>
            )}
            {verificationStatus === VerificationStatus.Rejected && (
              <Text color="red">
                The address was rejected on the Ledger device.
              </Text>
            )}
            {verificationError && (
              <Text color="brand.red">
                Cannot verify the address:
                <br />
                {verificationError.message}
              </Text>
            )}
          </Box>
          {isLedgerBasedAccount(account) && (
            <Box textAlign="center">
              <Button
                variant="whiteModal"
                onClick={verifyAndShow}
                isDisabled={verificationStatus === VerificationStatus.Pending}
                w={{ base: '100%', md: '80%' }}
                maxW={340}
              >
                Verify
              </Button>
            </Box>
          )}
        </ModalBody>
        <ModalFooter gap={2}>
          <Button
            isDisabled={
              isCopied || verificationStatus === VerificationStatus.Pending
            }
            onClick={() => onCopy(account.address)}
            w={{ base: '100%', md: '50%' }}
            variant="whiteModal"
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="whiteModal"
            onClick={close}
            w={{ base: '100%', md: '50%' }}
            isDisabled={verificationStatus === VerificationStatus.Pending}
          >
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ReceiveModal;
