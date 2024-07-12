import { useEffect } from 'react';
import { Form, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Card,
  CardBody,
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

import { Bech32AddressSchema } from '../api/schemas/address';
import { HexStringSchema } from '../api/schemas/common';
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
import { AnySpawnArguments, getTemplateNameByKey } from '../utils/templates';

import FormAddressSelect from './FormAddressSelect';
import FormInput from './FormInput';
import FormKeySelect from './FormKeySelect';
import FormMultiKeySelect from './FormMultiKeySelect';
import FormSelect from './FormSelect';

type CreateAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DisplayNameSchema = z.string().min(2);

const SingleSigSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.SingleSig),
  publicKey: HexStringSchema,
});

const MultiSigSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.MultiSig),
  required: z.number().min(0).max(10),
  publicKeys: z
    .array(HexStringSchema)
    .min(1, 'MultiSig account requires at least two parties'),
});

const VaultSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.Vault),
  owner: Bech32AddressSchema,
  totalAmount: z.string().min(0),
  initialUnlockAmount: z.string().min(0),
  vestingStart: z.number().min(0),
  vestingEnd: z.number().min(0),
});

const VestingSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.Vesting),
  required: z.number().min(0).max(10),
  publicKeys: z
    .array(HexStringSchema)
    .min(1, 'Vesting account requires at least two parties'),
});

const FormSchema = z.discriminatedUnion('templateAddress', [
  SingleSigSchema,
  MultiSigSchema,
  VaultSchema,
  VestingSchema,
]);

type FormValues = z.infer<typeof FormSchema>;

const extractSpawnArgs = (data: FormValues): AnySpawnArguments => {
  let args;
  args = SingleSigSchema.safeParse(data);
  if (args.success) {
    return { PublicKey: args.data.publicKey };
  }
  args = MultiSigSchema.safeParse(data);
  if (args.success) {
    return { Required: args.data.required, PublicKeys: args.data.publicKeys };
  }
  args = VestingSchema.safeParse(data);
  if (args.success) {
    return { Required: args.data.required, PublicKeys: args.data.publicKeys };
  }
  args = VaultSchema.safeParse(data);
  if (args.success) {
    return {
      Owner: args.data.owner,
      TotalAmount: args.data.totalAmount,
      InitialUnlockAmount: args.data.initialUnlockAmount,
      VestingStart: args.data.vestingStart,
      VestingEnd: args.data.vestingEnd,
    };
  }

  throw new Error('Cannot get required inputs to create an account');
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
    required: 1,
    publicKeys: [keys[0]?.publicKey || '0x1'],
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
  const selectedOwner = watch('owner');
  const totalAmount = watch('totalAmount');

  useEffect(() => {
    if (selectedTemplate === StdPublicKeys.Vault) {
      register('initialUnlockAmount', {
        required: 'Please specify the initial unlock amount',
      });
      return () => unregister('initialUnlockAmount');
    }
    return noop;
  }, [register, selectedTemplate, unregister]);

  useEffect(() => {
    const owner = selectedOwner || getValues('owner');
    if (Object.hasOwn(GENESIS_VESTING_ACCOUNTS, owner)) {
      const amount =
        GENESIS_VESTING_ACCOUNTS[
          owner as keyof typeof GENESIS_VESTING_ACCOUNTS
        ];
      setValue('totalAmount', String(amount));
      setValue('initialUnlockAmount', String(amount / 4n));
      setValue('vestingStart', GENESIS_VESTING_START);
      setValue('vestingEnd', GENESIS_VESTING_END);
    }
  }, [getValues, selectedOwner, selectedTemplate, setValue]);

  useEffect(() => {
    if (totalAmount) {
      setValue('initialUnlockAmount', String(BigInt(totalAmount) / 4n));
    }
  }, [totalAmount, setValue]);

  const submit = handleSubmit(async (data) => {
    const success = await withPassword(
      (password) =>
        createAccount(
          data.displayName,
          data.templateAddress,
          extractSpawnArgs(data),
          password
        ),
      'Creating a new Account',
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
              fieldName="owner"
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
              register={register('totalAmount', {
                required: 'Please specify total amount locked in the vault',
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Vesting start (layer number)"
              inputProps={{ type: 'number' }}
              register={register('vestingStart', {
                required: 'Please specify the epoch when the vesting starts',
                valueAsNumber: true,
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Vesting end (layer number)"
              inputProps={{ type: 'number' }}
              register={register('vestingEnd', {
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
              It is used to drain vaults by companies?..
            </Text>
            <FormInput
              label="Required amount of signatures"
              inputProps={{ type: 'number' }}
              register={register('required', {
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
              fieldName="publicKeys"
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
              register={register('required', {
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
              fieldName="publicKeys"
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
              fieldName="publicKey"
              keys={keys}
              register={register}
              unregister={unregister}
              errors={errors}
              isSubmitted={isSubmitted}
              isRequired
            />
          </>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <Form control={control}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Create a new Account</ModalHeader>
          <ModalBody minH={0}>
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
            <Card variant="outline">
              <CardBody>{renderTemplateSpecificFields()}</CardBody>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={submit} ml={2}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
}

export default CreateAccountModal;
