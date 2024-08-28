import { Form, useForm } from 'react-hook-form';

import {
  Button,
  Checkbox,
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
  createSingleSig: boolean;
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

  const close = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit(
    async ({ displayName, secretKey, createSingleSig }) => {
      const success = await withPassword(
        async (password) => {
          await importKeyPair(
            displayName,
            secretKey,
            password,
            createSingleSig
          );
          return true;
        },
        'Importing the Key Pair',
        // eslint-disable-next-line max-len
        `Please enter the password to create the new key pair "${displayName}" from the secret key.`
      );
      if (success) {
        close();
      }
    }
  );
  return (
    <Modal isOpen={isOpen} onClose={close} isCentered size="lg">
      <Form control={control}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">Import the Key Pair</ModalHeader>
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
                  message: 'Give your account a meaningful name',
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
                    return `The secret key must be 64 bytes long`;
                  }
                  if (keys.includes(trimmed.slice(64))) {
                    return `You already have this key in the wallet file`;
                  }
                  return true;
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
              textareaProps={{
                border: '1px',
                borderRadius: 'md',
                borderColor: 'brand.lightGray',
                textColor: 'brand.lightGray',
                bg: 'brand.modalGreen',
                _hover: { border: '1px', borderRadius: 'md' },
                _focus: {
                  borderColor: 'brand.lightGray',
                  boxShadow: 'none',
                },
              }}
            />
            <Text fontSize="xs" color="gray" mt={2} mb={2}>
              The secret key should be a hexadecimal string.
              <br />
              Public key will be extracted from the secret key.
            </Text>
            <Checkbox
              size="lg"
              colorScheme="green"
              defaultChecked
              {...register('createSingleSig', { value: true })}
            >
              <Text fontSize="md">Create SingleSig account automatically</Text>
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button onClick={submit} ml={2} variant="whiteModal">
              Import
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
}

export default ImportKeyPairModal;
