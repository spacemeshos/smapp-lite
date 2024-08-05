import { useState } from 'react';
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
import { useCopyToClipboard } from '@uidotdev/usehooks';

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
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  let timeout: ReturnType<typeof setTimeout>;
  const onCopyClick = (data: string) => () => {
    clearTimeout(timeout);
    copy(data);
    setIsCopied(true);
    timeout = setTimeout(() => {
      setIsCopied(false);
    }, 5000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center">Receive funds</ModalHeader>
        <ModalBody>
          <Text fontSize="sm" mb={4}>
            {account.address}
            <CopyButton value={account.address} />
          </Text>
          <QRCode
            bgColor="var(--chakra-colors-gray-700)"
            fgColor="var(--chakra-colors-gray-300)"
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={account.address}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="dark"
            isDisabled={isCopied}
            onClick={onCopyClick(account.address)}
            mr={2}
            w="50%"
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="dark" onClick={onClose} ml={2} w="50%">
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ReceiveModal;
