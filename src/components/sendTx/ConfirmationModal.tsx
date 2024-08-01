// TODO
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
import { MultiSigPart, SingleSig } from '@spacemesh/sm-codec/lib/codecs';
import { IconChevronDown } from '@tabler/icons-react';

import { Bech32Address, HexString } from '../../types/common';
import { KeyPairType, SafeKeyWithType } from '../../types/wallet';
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
  signatures?: SingleSig | MultiSigPart[];
  required?: number;
  isMultiSig?: boolean;
};

type ConfirmationModalProps = ConfirmationData & {
  onClose: () => void;
  onSubmit: (
    signWith: HexString,
    externalSignature?: HexString
  ) => Promise<boolean>;
  onExport: (
    signWith: HexString | null,
    externalSignature?: HexString
  ) => Promise<boolean>;
  isOpen: boolean;
  estimatedGas: bigint | null;
  isLedgerRejected?: boolean;
};

const renderTemplateSpecificFields = (form: FormValues) => {
  switch (form.templateAddress) {
    case StdPublicKeys.SingleSig: {
      if (form.payload.methodSelector === MethodSelectors.Spawn) {
        const args = SingleSigSpawnSchema.parse(form.payload);
        return <PreviewDataRow label="Public key" value={args.PublicKey} />;
      }
      if (form.payload.methodSelector === MethodSelectors.Spend) {
        const args = SpendSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow
              label="Destination address"
              value={args.Destination}
            />
            <PreviewDataRow label="Amount" value={formatSmidge(args.Amount)} />
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
      if (form.payload.methodSelector === MethodSelectors.Spawn) {
        const args = MultiSigSpawnSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow
              label="Required signatures"
              value={String(args.Required)}
            />
            {args.PublicKeys.map((pk, i) => (
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
              value={args.Destination}
            />
            <PreviewDataRow label="Amount" value={formatSmidge(args.Amount)} />
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
            <PreviewDataRow label="Vault address" value={args.Vault} />
            <PreviewDataRow
              label="Destination address"
              value={String(args.Destination)}
            />
            <PreviewDataRow label="Amount" value={String(args.Amount)} />
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
      if (form.payload.methodSelector === MethodSelectors.Spawn) {
        const args = VaultSpawnSchema.parse(form.payload);
        return (
          <>
            <PreviewDataRow label="Owner address" value={args.Owner} />
            <PreviewDataRow
              label="Total amount"
              value={String(args.TotalAmount)}
            />
            <PreviewDataRow
              label="Initial unlock amount"
              value={String(args.InitialUnlockAmount)}
            />
            <PreviewDataRow
              label="Vesting start (layer)"
              value={String(args.VestingStart)}
            />
            <PreviewDataRow
              label="Vesting end (layer)"
              value={String(args.VestingEnd)}
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
              value={args.Destination}
            />
            <PreviewDataRow label="Amount" value={formatSmidge(args.Amount)} />
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
  isLedgerRejected = false,
  eligibleKeys,
  estimatedGas,
  signatures = undefined,
  required = 1,
  isMultiSig = false,
  isOpen,
  onClose,
  onSubmit,
  onExport,
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
  const hasSingleSig = useMemo(
    () => !!signatures && signatures instanceof Uint8Array,
    [signatures]
  );

  useEffect(() => {
    if (hasSingleSig) {
      // If SingleSig with attached signature,
      // then put it into signature input
      setValue('signWith', EXTERNAL);
    } else {
      // Otherwise select eligible keys as usually
      setValue('signWith', eligibleKeys[0]?.publicKey || EXTERNAL);
    }

    return () => reset();
  }, [eligibleKeys, hasSingleSig, setValue, signatures, reset]);

  useEffect(() => {
    if (signWith !== EXTERNAL) {
      unregister('externalSignature');
    }
    if (signWith === EXTERNAL && hasSingleSig) {
      // If signature is already provided — put it as External signature
      setValue('externalSignature', toHexString(signatures as SingleSig));
    }
  }, [unregister, signWith, setValue, hasSingleSig, signatures]);

  const submit = handleSubmit(async (data) => {
    const res = await onSubmit(data.signWith, data.externalSignature);
    if (res) {
      reset();
    }
  });

  const exportSigned = handleSubmit(async (data) => {
    const res = await onExport(data.signWith, data.externalSignature);
    if (res) {
      reset();
    }
  });

  const exportUnsigned = handleSubmit(async () => {
    const res = await onExport(null);
    if (res) {
      reset();
    }
  });

  const renderSignatures = () => {
    if (!signatures || signatures.length === 0) return null;
    if (isMultiSig) {
      const multisig = signatures as MultiSigPart[];
      return (
        <Box mb={2}>
          <Text fontSize="xs" color="whiteAlpha.600">
            With signatures:
          </Text>
          {multisig.map((sig) => {
            const hex = toHexString(sig.Sig);
            return (
              <Flex fontSize="xx-small" key={hex}>
                <Text whiteSpace="nowrap" mr={2} color="whiteAlpha.800">
                  Ref: {String(sig.Ref)}
                </Text>
                <Text whiteSpace="pre-wrap" wordBreak="break-all">
                  {hex}
                </Text>
              </Flex>
            );
          })}
        </Box>
      );
    }
    // Do not display it for SingleSig
    return null;
  };

  const renderActions = () => {
    if (!isMultiSig) {
      return (
        <ButtonGroup isAttached>
          <Button colorScheme="blue" onClick={submit} ml={2} mr="1px">
            {hasSingleSig ? 'Publish' : 'Sign & Publish'}
          </Button>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<IconChevronDown />}
              colorScheme="blue"
              minW={8}
            />
            <MenuList>
              <MenuItem onClick={exportSigned}>
                {hasSingleSig ? 'Export Signed' : 'Sign & Export'}
              </MenuItem>
              <MenuItem onClick={exportUnsigned}>Export Unsigned</MenuItem>
            </MenuList>
          </Menu>
        </ButtonGroup>
      );
    }

    const hasAllSignatures = signatures && signatures.length === required;
    const missingOneSignature = (signatures?.length ?? 0) === required - 1;

    const mayPublish = hasAllSignatures || missingOneSignature;

    return (
      <ButtonGroup isAttached>
        <Button
          colorScheme="blue"
          onClick={mayPublish ? submit : exportSigned}
          ml={2}
          mr="1px"
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {hasAllSignatures
            ? 'Publish'
            : missingOneSignature
            ? 'Sign & Publish'
            : 'Sign & Export'}
        </Button>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<IconChevronDown />}
            colorScheme="blue"
            minW={8}
          />
          <MenuList>
            {mayPublish && (
              <MenuItem onClick={exportSigned}>
                {hasAllSignatures ? 'Export Signed' : 'Sign & Export'}
              </MenuItem>
            )}
            <MenuItem onClick={exportUnsigned}>Export Unsigned</MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>
    );
  };

  const shouldSign = !isMultiSig || signatures?.length !== required;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader pb={0}>Verify transaction</ModalHeader>
        <ModalBody minH={0}>
          {isLedgerRejected && (
            <Text mb={2} color="red">
              Transaction rejected by Ledger
            </Text>
          )}
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
          {renderSignatures()}
          {shouldSign && (
            <>
              <Divider mb={2} />
              <FormControl
                isInvalid={isSubmitted && !!errors.signWith?.message}
              >
                <FormLabel>Sign transaction using key:</FormLabel>
                <Select
                  {...register('signWith', {
                    value: eligibleKeys[0]?.publicKey,
                    required:
                      // eslint-disable-next-line max-len
                      'Please select at least one eligible key to sign transaction',
                  })}
                >
                  {eligibleKeys.map((kp) => (
                    <option key={kp.publicKey} value={kp.publicKey}>
                      {`${kp.displayName} (${getAbbreviatedHexString(
                        kp.publicKey
                      )})`}
                      {kp.type === KeyPairType.Hardware
                        ? ' — Hardware Wallet'
                        : null}
                    </option>
                  ))}
                  <option value={EXTERNAL}>External signature</option>
                </Select>
                {errors.signWith?.message && (
                  <FormErrorMessage>{errors.signWith.message}</FormErrorMessage>
                )}
              </FormControl>
              {/* TODO: Add REF field for External signature of MultiSig TX */}
              {signWith === EXTERNAL && (
                <FormInput
                  label="Put the signature for the transaction:"
                  register={register('externalSignature', {
                    required:
                      'Please provide a signature to sign transaction with',
                    minLength: 128,
                    maxLength: 128,
                  })}
                  errors={errors}
                  isSubmitted={isSubmitted}
                />
              )}
            </>
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
          {renderActions()}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ConfirmationModal;
