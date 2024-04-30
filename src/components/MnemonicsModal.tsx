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
  Portal,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useCopyToClipboard } from '@uidotdev/usehooks';

type MnemonicsModalProps = {
  mnemonics: string;
  isOpen: boolean;
  onClose: () => void;
};

function MnemonicsModal({
  mnemonics,
  isOpen,
  onClose,
}: MnemonicsModalProps): JSX.Element {
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
    <Portal>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalCloseButton />
        <ModalContent>
          <ModalHeader>Backup mnemonics</ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Please keep your mnemonics secret and do not share with anyone.
              They can be used to restore your wallet and access to your funds.
            </Text>
            <Textarea readOnly value={mnemonics} rows={4} resize="none" />
            <Text fontSize="xs" color="gray" mt={2}>
              We recommend you to remember mnemonics and not store them on your
              computer. Or write them down on a piece of paper and keep it in a
              safe place.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={isCopied}
              onClick={onCopyClick(mnemonics)}
              w={20}
            >
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
            <Button colorScheme="blue" onClick={onClose} ml={2}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Portal>
  );
}

export default MnemonicsModal;