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

import useHardwareWallet from '../store/useHardwareWallet';
import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import Bip32KeyDerivation from '../utils/bip32';

import FormInput from './FormInput';

type ImportKeyFromLedgerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormValues = {
  displayName: string;
  path: string;
  createSingleSig: boolean;
};

function ImportKeyFromLedgerModal({
  isOpen,
  onClose,
}: ImportKeyFromLedgerModalProps): JSX.Element {
  const { addForeignKey } = useWallet();
  const { withPassword } = usePassword();
  const { checkDeviceConnection, connectedDevice, modalConnect } =
    useHardwareWallet();

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
      const isConnected = await checkDeviceConnection();
      if (!isConnected) {
        return;
      }
      if (!connectedDevice) {
        modalConnect.onOpen();
        return;
      }
      const publicKey = await connectedDevice.actions.getPubKey(path);
      const success = await withPassword(
        async (password) => {
          await addForeignKey(
            { displayName, path, publicKey },
            password,
            createSingleSig
          );
          return true;
        },
        'Import PublicKey from Ledger device',
        // eslint-disable-next-line max-len
        `Please enter the password to store public key ${publicKey} in the wallet.`
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
          <ModalHeader textAlign="center">
            Import Public Key from Ledger
          </ModalHeader>
          <ModalBody>
            <Text mb={4}>
              Only public key will be imported from the Ledger.
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
                value: Bip32KeyDerivation.createPath(0),
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
            <Button onClick={submit} ml={2} variant="whiteModal">
              Import Public Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
}

export default ImportKeyFromLedgerModal;
