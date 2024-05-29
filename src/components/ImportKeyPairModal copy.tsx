import { Form, useForm } from 'react-hook-form';

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

import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import { HexString } from '../types/common';

import FormInput from './FormInput';
import FormTextarea from './FormTextarea';

type ImportKeyPairModalProps = {
  isOpen: boolean;
  onClose: () => void;
  keys: HexString[];
};

type FormValues = {
  displayName: string;
  secretKey: HexString;
};

function ImportKeyPairModal({
  isOpen,
  onClose,
  keys,
}: ImportKeyPairModalProps): JSX.Element {
  const { importKeyPair } = useWallet();
  const { withPassword } = usePassword();
  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>();

  const submit = handleSubmit(async ({ displayName, secretKey }) => {
    const success = await withPassword(
      (password) => importKeyPair(displayName, secretKey, password),
      'Importing the Key Pair',
      // eslint-disable-next-line max-len
      `Please enter the password to create the new key pair "${displayName}" from the secret key.`
    );
    if (success) {
      reset();
      onClose();
    }
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <Form control={control}>
        <ModalOverlay />
        <ModalCloseButton />
        <ModalContent>
          <ModalHeader>Import the Key Pair</ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Please set the name for your key and paste the secret key in the
              textarea below.
            </Text>
            <FormInput
              label="Name"
              register={register('displayName', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Give some meaningful name to your account',
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormTextarea
              label="Secret key"
              register={register('secretKey', {
                required: 'Secret key is required for import',
                validate: (value) => {
                  const trimmed = value.replace(/^0x/, '');
                  if (trimmed.length !== 128) {
                    // eslint-disable-next-line max-len
                    return `Secret key must be 64 bytes length`;
                  }
                  if (keys.includes(trimmed.slice(64))) {
                    return `You already have this key in the wallet file`;
                  }
                  return true;
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <Text fontSize="xs" color="gray" mt={2}>
              The secret key should be a hexadecimal string.
              <br />
              Public key will be extracted from the secret key.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={submit} ml={2}>
              Import
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
}

export default ImportKeyPairModal;
