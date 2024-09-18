import { useEffect } from 'react';
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

import useCopy from '../hooks/useCopy';
import useMnemonics from '../hooks/useMnemonics';

function MnemonicsModal(): JSX.Element {
  const { mnemonics, closeMnemonicsModal, isOpen } = useMnemonics();
  const { setValue, register } = useForm<{ mnemonics: string }>();
  const { isCopied, onCopy } = useCopy();

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
        <ModalHeader textAlign="center">Backup mnemonics</ModalHeader>
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
            borderColor="brand.darkGreen"
            translate="no"
          />
          <Text fontSize="xs" color="gray" mt={2}>
            We recommend you to remember mnemonics and not store them on your
            computer. Or write them down on a piece of paper and keep it in a
            safe place.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            isDisabled={isCopied}
            onClick={() => onCopy(mnemonics)}
            w={20}
            variant="whiteModal"
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button onClick={closeMnemonicsModal} ml={2} variant="whiteModal">
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default MnemonicsModal;
