import QRCode from 'react-qr-code';

import {
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
import { AccountWithAddress } from '../types/wallet';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center">Receive funds</ModalHeader>
        <ModalBody>
          <Text fontSize="sm" mb={4} textAlign="center">
            {account.address}
            <CopyButton value={account.address} />
          </Text>
          <QRCode
            bgColor="var(--chakra-colors-brand-lightGray)"
            fgColor="var(--chakra-colors-blackAlpha-500)"
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={account.address}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={isCopied}
            onClick={() => onCopy(account.address)}
            mr={2}
            w="50%"
            variant="whiteModal"
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="whiteModal" onClick={onClose} ml={2} w="50%">
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ReceiveModal;
