import { useEffect } from 'react';
import { Form, useForm } from 'react-hook-form';

import {
  Box,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { StdPublicKeys } from '@spacemesh/sm-codec';

import { useCurrentHRP } from '../hooks/useNetworkSelectors';
import { useAccountsList } from '../hooks/useWalletSelectors';
import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import {
  GENESIS_VESTING_ACCOUNTS,
  GENESIS_VESTING_END,
  GENESIS_VESTING_START,
} from '../utils/constants';
import { noop } from '../utils/func';
import { getTemplateNameByKey } from '../utils/templates';

import {
  extractSpawnArgs,
  FormSchema,
  FormValues,
} from './createAccountSchema';
import FormAddressSelect from './FormAddressSelect';
import FormInput from './FormInput';
import FormKeySelect from './FormKeySelect';
import FormMultiKeySelect from './FormMultiKeySelect';
import FormSelect from './FormSelect';

type CreateAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function CreateAccountModal({
  isOpen,
  onClose,
}: CreateAccountModalProps): JSX.Element {
  const { createAccount, wallet } = useWallet();
  const { withPassword } = usePassword();
  const hrp = useCurrentHRP();
  const accounts = useAccountsList(hrp);
  const keys = wallet?.keychain || [];
  const defaultValues = {
    displayName: '',
    Required: 1,
    PublicKeys: [keys[0]?.publicKey || '0x1'],
  };
  const {
    watch,
    register,
    unregister,
    reset,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });
  const selectedTemplate = watch('templateAddress');
  const selectedOwner = watch('Owner');
  const totalAmount = watch('TotalAmount');

  useEffect(() => {
    if (selectedTemplate === StdPublicKeys.Vault) {
      register('InitialUnlockAmount', {
        required: 'Please specify the initial unlock amount',
      });
      return () => unregister('InitialUnlockAmount');
    }
    return noop;
  }, [register, selectedTemplate, unregister]);

  useEffect(() => {
    const owner = selectedOwner || getValues('Owner');
    if (Object.hasOwn(GENESIS_VESTING_ACCOUNTS, owner)) {
      const amount =
        GENESIS_VESTING_ACCOUNTS[
          owner as keyof typeof GENESIS_VESTING_ACCOUNTS
        ];
      setValue('TotalAmount', String(amount));
      setValue('InitialUnlockAmount', String(amount / 4n));
      setValue('VestingStart', GENESIS_VESTING_START);
      setValue('VestingEnd', GENESIS_VESTING_END);
    }
  }, [getValues, selectedOwner, selectedTemplate, setValue]);

  useEffect(() => {
    if (totalAmount) {
      setValue('InitialUnlockAmount', String(BigInt(totalAmount) / 4n));
    }
  }, [totalAmount, setValue]);

  const close = () => {
    reset(defaultValues);
    onClose();
  };

  const submit = handleSubmit(async (data) => {
    const success = await withPassword(
      (password) =>
        createAccount(
          data.displayName,
          data.templateAddress,
          extractSpawnArgs(data),
          password
        ),
      'Create an Account',
      // eslint-disable-next-line max-len
      `Please enter the password to create the new account "${
        data.displayName
      }" of type "${getTemplateNameByKey(data.templateAddress)}"`
    );
    if (success) {
      reset(defaultValues);
      onClose();
    }
  });

  const renderTemplateSpecificFields = () => {
    switch (selectedTemplate) {
      case StdPublicKeys.Vault:
        return (
          <>
            <Text fontWeight="bold">Vault</Text>
            <Text fontSize="sm" mb={1}>
              The vault holds some funds for its owner and unlocks them due to
              pre-defined vesting schedule.
            </Text>
            <FormAddressSelect
              fieldName="Owner"
              accounts={accounts.filter(
                (acc) => acc.templateAddress === StdPublicKeys.Vesting
              )}
              register={register}
              unregister={unregister}
              errors={errors}
              isSubmitted={isSubmitted}
              isRequired
              setValue={setValue}
              getValues={getValues}
            />
            <FormInput
              label="Total amount"
              inputProps={{ type: 'number' }}
              register={register('TotalAmount', {
                required: 'Please specify total amount locked in the vault',
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Vesting start (layer number)"
              inputProps={{ type: 'number' }}
              register={register('VestingStart', {
                required: 'Please specify the epoch when the vesting starts',
                valueAsNumber: true,
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Vesting end (layer number)"
              inputProps={{ type: 'number' }}
              register={register('VestingEnd', {
                required: 'Please specify the epoch when the vesting ends',
                valueAsNumber: true,
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
          </>
        );
      case StdPublicKeys.Vesting:
        return (
          <>
            <Text fontWeight="bold">Vesting Account</Text>
            <Text fontSize="sm" mb={1}>
              It is used to drain Vault Accounts
            </Text>
            <FormInput
              label="Required amount of signatures"
              inputProps={{ type: 'number' }}
              register={register('Required', {
                required: 'Please specify any number from 0 to 10',
                valueAsNumber: true,
                validate: (n) => {
                  if (n < 1) {
                    return 'Required amount must be grater than 0';
                  }
                  if (n > 10) {
                    return 'Required amount must be less or equal to 10';
                  }
                  return true;
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormMultiKeySelect
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              fieldName="PublicKeys"
              keys={keys}
              control={control}
              register={register}
              unregister={unregister}
              errors={errors}
              isSubmitted={isSubmitted}
            />
          </>
        );
      case StdPublicKeys.MultiSig:
        return (
          <>
            <Text fontWeight="bold">Multiple Signatures</Text>
            <Text fontSize="sm" mb={1}>
              MultiSig account requires more than one signature to submit a
              transaction. You need to know Public Keys of other parties to
              create a MultiSig account.
            </Text>
            <FormInput
              label="Required amount of signatures"
              inputProps={{ type: 'number' }}
              register={register('Required', {
                required: 'Please specify any number from 0 to 10',
                valueAsNumber: true,
                validate: (n) => {
                  if (n < 1) {
                    return 'Required amount must be grater than 0';
                  }
                  if (n > 10) {
                    return 'Required amount must be less or equal to 10';
                  }
                  return true;
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormMultiKeySelect
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              fieldName="PublicKeys"
              keys={keys}
              control={control}
              register={register}
              unregister={unregister}
              errors={errors}
              isSubmitted={isSubmitted}
            />
          </>
        );
      case StdPublicKeys.SingleSig:
      default:
        return (
          <>
            <Text fontWeight="bold">Single Signature</Text>
            <Text fontSize="sm" mb={1}>
              The default account that requires only one signature to submit a
              transaction.
            </Text>
            <FormKeySelect
              fieldName="PublicKey"
              keys={keys}
              register={register}
              unregister={unregister}
              errors={errors}
              isSubmitted={isSubmitted}
              isRequired
              value={keys[0]?.publicKey}
            />
          </>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered size="lg">
      <Form control={control}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">Create a new Account</ModalHeader>
          <ModalBody>
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
            <FormSelect
              label="Account type"
              register={register('templateAddress', {
                value: StdPublicKeys.SingleSig,
              })}
              options={[
                { value: StdPublicKeys.SingleSig, label: 'SingleSig' },
                { value: StdPublicKeys.MultiSig, label: 'MultiSig' },
                { value: StdPublicKeys.Vault, label: 'Vault' },
                { value: StdPublicKeys.Vesting, label: 'Vesting' },
              ]}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <Box pt={2} pb={1} color="brand.lightGray">
              {renderTemplateSpecificFields()}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={submit} variant="whiteModal" w="full">
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
}

export default CreateAccountModal;
