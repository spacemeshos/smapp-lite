import { useEffect } from 'react';
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

import FormInput from './FormInput';

type RenameKeyModalProps = {
  keyIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

type FormValues = {
  displayName: string;
};

function RenameKeyModal({
  keyIndex,
  isOpen,
  onClose,
}: RenameKeyModalProps): JSX.Element | null {
  const { renameKey, wallet } = useWallet();
  const { withPassword } = usePassword();
  const {
    register,
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>();

  const close = () => {
    reset();
    onClose();
  };

  const key = wallet?.keychain[keyIndex];

  useEffect(() => {
    if (key) {
      setValue('displayName', key.displayName);
    }
  }, [key, setValue]);

  if (!key) {
    return null;
  }

  const submit = handleSubmit(async ({ displayName }) => {
    const success = await withPassword(
      async (password) => {
        await renameKey(keyIndex, displayName, password);
        return true;
      },
      'Rename Key',
      // eslint-disable-next-line max-len
      `Please enter the password to change the name of key "${key.displayName}" (${key.path}) to "${displayName}":`
    );
    if (success) {
      close();
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered size="lg">
      <Form control={control}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">
            Change the name of Key Pair
          </ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Please specify the new name for the key pair with the path:{' '}
              {key.path}
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
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={submit}
              ml={2}
              variant="whiteModal"
              px={10}
            >
              Rename
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
}

export default RenameKeyModal;
