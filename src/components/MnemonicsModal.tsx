import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

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

import useMnemonics from '../hooks/useMnemonics';

function MnemonicsModal(): JSX.Element {
  const { mnemonics, closeMnemonicsModal, isOpen } = useMnemonics();
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  const { setValue, register } = useForm<{ mnemonics: string }>();

  let timeout: ReturnType<typeof setTimeout>;
  const onCopyClick = (data: string) => () => {
    clearTimeout(timeout);
    copy(data);
    setIsCopied(true);
    timeout = setTimeout(() => {
      setIsCopied(false);
    }, 5000);
  };

  useEffect(() => {
    // Used to clean up mnemonics from memory
    setValue('mnemonics', mnemonics);
    return () => {
      setValue('mnemonics', '');
    };
  }, [mnemonics, setValue]);

  return (
    <Modal isOpen={isOpen} onClose={closeMnemonicsModal} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Backup mnemonics</ModalHeader>
        <ModalBody>
          <Text mb={4}>
            Please keep your mnemonics secret and do not share with anyone. They
            can be used to restore your wallet and access to your funds.
          </Text>
          <Textarea
            {...register('mnemonics', {
              value: mnemonics,
            })}
            readOnly
            rows={4}
            resize="none"
          />
          <Text fontSize="xs" color="gray" mt={2}>
            We recommend you to remember mnemonics and not store them on your
            computer. Or write them down on a piece of paper and keep it in a
            safe place.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isCopied} onClick={onCopyClick(mnemonics)} w={20}>
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button colorScheme="blue" onClick={closeMnemonicsModal} ml={2}>
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default MnemonicsModal;
