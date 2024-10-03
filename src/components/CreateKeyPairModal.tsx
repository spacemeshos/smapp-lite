import { Form, useForm } from 'react-hook-form';

import {
  Button,
  Checkbox,
  Link,
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
import Bip32KeyDerivation from '../utils/bip32';

import FormInput from './FormInput';

type CreateKeyPairModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormValues = {
  displayName: string;
  path: string;
  createSingleSig: boolean;
};

function CreateKeyPairModal({
  isOpen,
  onClose,
}: CreateKeyPairModalProps): JSX.Element {
  const { createKeyPair, wallet } = useWallet();
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
    async ({ displayName, path, createSingleSig }) => {
      const success = await withPassword(
        async (password) => {
          await createKeyPair(displayName, path, password, createSingleSig);
          return true;
        },
        'Create a Key Pair',
        // eslint-disable-next-line max-len
        `Please enter the password to create the new key pair "${displayName}" with path "${path}"`
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
          <ModalHeader textAlign="center">Create a new Key Pair</ModalHeader>
          <ModalBody>
            <Text mb={4}>
              New key pair will be derived from your mnemonics using the
              derivation path (
              <Link
                // eslint-disable-next-line max-len
                href="https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki"
                target="_blank"
                rel="noreferrer"
                color="blue.300"
              >
                BIP-32 standard
              </Link>
              ).
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
            <FormInput
              label="Derivation Path"
              register={register('path', {
                required: 'Derivation path is required',
                value: Bip32KeyDerivation.createPath(
                  (wallet?.keychain || []).length
                ),
                validate: (value) => {
                  const valid = Bip32KeyDerivation.isValidPath(value);
                  if (!valid) {
                    // eslint-disable-next-line max-len
                    return `Derivation path should follow rules and starts with "m/${Bip32KeyDerivation.BIP_PROPOSAL}'/${Bip32KeyDerivation.COIN_TYPE}'/"`;
                  }
                  return true;
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
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
            <Button
              colorScheme="blue"
              onClick={submit}
              ml={2}
              variant="whiteModal"
              px={10}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
}

export default CreateKeyPairModal;
