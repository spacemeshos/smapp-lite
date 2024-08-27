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
import useRevealSecretKey from '../hooks/useRevealSecretKey';

function RevealSecretKey(): JSX.Element {
  const { secretKey, isOpen, closeSecretKeyModal } = useRevealSecretKey();
  const { setValue, register } = useForm<{ secretKey: string }>();
  const { isCopied, onCopy } = useCopy();

  useEffect(() => {
    // Used to clean up mnemonics from memory
    setValue('secretKey', secretKey?.secretKey || '');
    return () => {
      setValue('secretKey', '');
    };
  }, [secretKey, setValue]);

  return (
    <Modal isOpen={isOpen} onClose={closeSecretKeyModal} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center">Secret Key</ModalHeader>
        <ModalBody>
          <Text mb={4} textAlign="center">
            This is the secret key for account &quot;
            {secretKey?.displayName ?? ''}&quot;.
          </Text>
          <Textarea
            readOnly
            {...register('secretKey', { value: secretKey?.secretKey ?? '' })}
            rows={4}
            resize="none"
          />
          <Text fontSize="xs" color="gray" mt={2}>
            Please keep it secret and do not share it to anyone, otherwise your
            funds might be stolen.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={isCopied}
            onClick={() => onCopy(secretKey?.secretKey ?? '')}
            w={20}
            variant="whiteModal"
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="whiteModal" onClick={closeSecretKeyModal} ml={2}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RevealSecretKey;
