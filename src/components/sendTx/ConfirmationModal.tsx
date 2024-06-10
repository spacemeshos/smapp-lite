// TODO
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from '@chakra-ui/react';
import { StdPublicKeys } from '@spacemesh/sm-codec';

import { Bech32Address, HexString } from '../../types/common';
import { SafeKeyWithType } from '../../types/wallet';
import { getAbbreviatedHexString } from '../../utils/abbr';
import { toHexString } from '../../utils/hexString';
import { formatSmidge } from '../../utils/smh';
import {
  getMethodName,
  getTemplateNameByKey,
  MethodSelectors,
} from '../../utils/templates';
import FormInput from '../FormInput';
import FormKeySelect from '../FormKeySelect';
import PreviewDataRow from '../PreviewDataRow';

import {
  DrainSchema,
  FormValues,
  MultiSigSpawnSchema,
  SingleSigSpawnSchema,
  SpendSchema,
  VaultSpawnSchema,
} from './schemas';

export type ConfirmationData = {
  principal: Bech32Address;
  form: FormValues;
  encoded: Uint8Array;
  eligibleKeys: SafeKeyWithType[];
};

type ConfirmationModalProps = ConfirmationData & {
  onClose: () => void;
  onSubmit: (signWith: HexString, externalSignature?: HexString) => void;
  isOpen: boolean;
  estimatedGas: bigint | null;
};

const renderTemplateSpecificFields = (form: FormValues) => {
  switch (form.templateAddress) {
    case StdPublicKeys.SingleSig: {
      if (form.payload.methodSelector === MethodSelectors.SelfSpawn) {
        const args = SingleSigSpawnSchema.parse(form.payload);
        return <PreviewDataRow label="Public key" value={args.publicKey} />;
      }
      if (form.payload.methodSelector === MethodSelectors.Spend) {
        const args = SpendSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow
              label="Destination address"
              value={args.destination}
            />
            <PreviewDataRow label="Amount" value={formatSmidge(args.amount)} />
          </>
        );
      }
      return (
        <Text color="orange" fontSize="xs">
          Unsupported method: {form.payload.methodSelector} for SingleSig
          account.
        </Text>
      );
    }
    case StdPublicKeys.MultiSig:
    case StdPublicKeys.Vesting: {
      if (form.payload.methodSelector === MethodSelectors.SelfSpawn) {
        const args = MultiSigSpawnSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow
              label="Required signatures"
              value={String(args.required)}
            />
            {args.publicKeys.map((pk, i) => (
              <PreviewDataRow key={pk} label={`Public Key ${i}`} value={pk} />
            ))}
          </>
        );
      }
      if (form.payload.methodSelector === MethodSelectors.Spend) {
        const args = SpendSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow
              label="Destination address"
              value={args.destination}
            />
            <PreviewDataRow label="Amount" value={formatSmidge(args.amount)} />
          </>
        );
      }
      if (
        form.templateAddress === StdPublicKeys.Vesting &&
        form.payload.methodSelector === MethodSelectors.Drain
      ) {
        const args = DrainSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow label="Vault address" value={args.vault} />
            <PreviewDataRow
              label="Destination address"
              value={String(args.destination)}
            />
            <PreviewDataRow label="Amount" value={String(args.amount)} />
          </>
        );
      }
      return (
        <Text color="orange" fontSize="xs">
          Unsupported method: {form.payload.methodSelector} for{' '}
          {getTemplateNameByKey(form.templateAddress)}.
        </Text>
      );
    }
    case StdPublicKeys.Vault: {
      if (form.payload.methodSelector === MethodSelectors.SelfSpawn) {
        const args = VaultSpawnSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow label="Owner address" value={args.owner} />
            <PreviewDataRow
              label="Total amount"
              value={String(args.totalAmount)}
            />
            <PreviewDataRow
              label="Initial unlock amount"
              value={String(args.initialUnlockAmount)}
            />
            <PreviewDataRow
              label="Vesting start (layer)"
              value={String(args.vestingStart)}
            />
            <PreviewDataRow
              label="Vesting end (layer)"
              value={String(args.vestingEnd)}
            />
          </>
        );
      }
      if (form.payload.methodSelector === MethodSelectors.Spend) {
        const args = SpendSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow
              label="Destination address"
              value={args.destination}
            />
            <PreviewDataRow label="Amount" value={formatSmidge(args.amount)} />
          </>
        );
      }
      return (
        <Text color="orange" fontSize="xs">
          Unsupported method: {form.payload.methodSelector} for Vault account.
        </Text>
      );
    }
    default: {
      return null;
    }
  }
};

type FormKeySelect = {
  signWith: HexString;
  externalSignature?: HexString;
};

const EXTERNAL = 'external';

function ConfirmationModal({
  principal,
  form,
  encoded,
  eligibleKeys,
  estimatedGas,
  isOpen,
  onClose,
  onSubmit,
}: ConfirmationModalProps): JSX.Element {
  const {
    watch,
    register,
    unregister,
    reset,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<FormKeySelect>();

  const signWith = watch('signWith');

  useEffect(() => {
    setValue('signWith', eligibleKeys[0]?.publicKey || EXTERNAL);
  }, [eligibleKeys, setValue]);

  useEffect(() => {
    if (signWith !== EXTERNAL) {
      unregister('externalSignature');
    }
  }, [unregister, signWith]);

  const submit = handleSubmit((data) => {
    reset();
    onSubmit(data.signWith, data.externalSignature);
  });

  const isSingleSig = form.templateAddress === StdPublicKeys.SingleSig;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalCloseButton />
      <ModalContent>
        <ModalHeader pb={0}>Verify transaction</ModalHeader>
        <ModalBody minH={0}>
          <PreviewDataRow label="Principal Address" value={principal} />
          <Flex>
            <Box w="50%" pr={2}>
              <PreviewDataRow
                label="Template"
                value={getTemplateNameByKey(form.templateAddress)}
              />
            </Box>
            <Box w="50%" pl={2}>
              <PreviewDataRow
                label="Method"
                value={getMethodName(form.payload.methodSelector)}
              />
            </Box>
          </Flex>
          <Flex>
            <Box w="50%" pr={2}>
              <PreviewDataRow
                label="Gas Price"
                value={formatSmidge(form.gasPrice)}
              />
            </Box>
            <Box w="50%" pl={2}>
              <PreviewDataRow label="Nonce" value={String(form.nonce)} />
            </Box>
          </Flex>
          {renderTemplateSpecificFields(form)}

          <Divider mb={1} />
          <PreviewDataRow
            label="Encoded tx"
            value={toHexString(encoded)}
            valueProps={{
              as: 'pre',
              fontSize: 'xx-small',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
            }}
          />
          <Divider mb={2} />
          <FormControl isInvalid={isSubmitted && !!errors.signWith?.message}>
            <FormLabel>Sign transaction using key:</FormLabel>
            <Select
              {...register('signWith', {
                value: eligibleKeys[0]?.publicKey,
                required:
                  'Please select at least one eligible key to sign transaction',
              })}
            >
              {eligibleKeys.map((kp) => (
                <option key={kp.publicKey} value={kp.publicKey}>
                  {`${kp.displayName} (${getAbbreviatedHexString(
                    kp.publicKey
                  )})`}
                </option>
              ))}
              <option value={EXTERNAL}>External signature</option>
            </Select>
            {errors.signWith?.message && (
              <FormErrorMessage>{errors.signWith.message}</FormErrorMessage>
            )}
          </FormControl>
          {signWith === EXTERNAL && (
            <FormInput
              label="Put the signature for the transaction:"
              register={register('externalSignature', {
                required: 'Please provide a signature to sign transaction with',
                minLength: 64,
                maxLength: 64,
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
          )}
          {!isSingleSig && (
            <Text color="orange" fontSize="sm" mt={2}>
              Sorry, only SingleSig account is supported at the moment.
            </Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Box flexGrow={1}>
            <PreviewDataRow
              label="Fee"
              value={
                estimatedGas
                  ? `${formatSmidge(BigInt(form.gasPrice) * estimatedGas)}`
                  : 'Loading...'
              }
            />
          </Box>
          <Button onClick={onClose} ml={2}>
            Back
          </Button>
          <Button
            colorScheme="blue"
            onClick={submit}
            ml={2}
            isDisabled={!isSingleSig}
          >
            Sign & Publish
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ConfirmationModal;
