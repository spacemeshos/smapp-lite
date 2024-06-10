import { useState } from 'react';

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
  Textarea,
} from '@chakra-ui/react';
import { useCopyToClipboard } from '@uidotdev/usehooks';

import { HexString } from '../types/common';

type RevealSecretKeyProps = {
  displayName: string;
  secretKey: HexString;
  isOpen: boolean;
  onClose: () => void;
};

function RevealSecretKey({
  displayName,
  secretKey,
  isOpen,
  onClose,
}: RevealSecretKeyProps): JSX.Element {
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
        <ModalHeader>Secret Key</ModalHeader>
        <ModalBody>
          <Text mb={4}>
            This is the secret key for account &quot;{displayName}&quot;.
          </Text>
          <Textarea readOnly value={secretKey} rows={4} resize="none" />
          <Text fontSize="xs" color="gray" mt={2}>
            Please keep it secret and do not share it to anyone, otherwise your
            funds might be stolen.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isCopied} onClick={onCopyClick(secretKey)} w={20}>
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button colorScheme="blue" onClick={onClose} ml={2}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RevealSecretKey;
