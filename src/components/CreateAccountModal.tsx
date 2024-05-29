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

import { HexStringSchema } from '../api/schemas/common';
import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import { AnySpawnArguments, getTemplateNameByKey } from '../utils/templates';

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
    .min(2, 'MultiSig account requires at least two parties'),
});

const VaultSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.Vault),
  owner: HexStringSchema,
  totalAmount: z.number().min(0),
  initialUnlockAmount: z.number().min(0),
  vestingStart: z.number().min(0),
  vestingEnd: z.number().min(0),
});

const VestingSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.Vesting),
  required: z.number().min(0).max(10),
  publicKeys: z
    .array(HexStringSchema)
    .min(2, 'Vesting account requires at least two parties'),
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
  const keys = wallet?.keychain || [];
  const defaultValues = {
    displayName: '',
    publicKeys: [
      keys[0]?.publicKey || '0x1',
      keys[1]?.publicKey || keys[0]?.publicKey || '0x2',
    ],
  };
  const {
    watch,
    register,
    unregister,
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });
  const selectedTemplate = watch('templateAddress');

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
            <FormKeySelect
              fieldName="owner"
              keys={keys}
              register={register}
              unregister={unregister}
              errors={errors}
              isSubmitted={isSubmitted}
              isRequired
            />
            <FormInput
              label="Total amount"
              inputProps={{ type: 'number' }}
              register={register('totalAmount', {
                required: 'Please specify total amount locked in the vault',
                valueAsNumber: true,
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Initial unlock amount"
              inputProps={{ type: 'number' }}
              register={register('initialUnlockAmount', {
                required: 'Please specify the initial unlock amount',
                valueAsNumber: true,
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Vesting start (epoch)"
              inputProps={{ type: 'number' }}
              register={register('vestingStart', {
                required: 'Please specify the epoch when the vesting starts',
                valueAsNumber: true,
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Vesting end (epoch)"
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
        <ModalCloseButton />
        <ModalContent>
          <ModalHeader>Create a new Account</ModalHeader>
          <ModalBody minH={0}>
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
