import { useEffect, useMemo, useState } from 'react';
import { Form, useForm } from 'react-hook-form';

import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { O, pipe } from '@mobily/ts-belt';
import {
  DrainArguments,
  MultiSigSpawnArguments as MultiSigSpawnArgumentsTx,
  MultiSigTemplate,
  SingleSigSpawnArguments as SingleSigSpawnArgumentsTx,
  SingleSigTemplate,
  SpendArguments,
  StdMethods,
  StdPublicKeys,
  StdTemplateKeys,
  VaultSpawnArguments as VaultSpawnArgumentsTx,
  VaultTemplate,
  VestingSpawnArguments as VestingSpawnArgumentsTx,
  VestingTemplate,
} from '@spacemesh/sm-codec';

import useDataRefresher from '../../hooks/useDataRefresher';
import {
  useCurrentGenesisID,
  useCurrentHRP,
} from '../../hooks/useNetworkSelectors';
import {
  useEstimateGas,
  useSignSingleSig,
  useSubmitTx,
} from '../../hooks/useTxMethods';
import {
  useAccountsList,
  useCurrentAccount,
} from '../../hooks/useWalletSelectors';
import useAccountData from '../../store/useAccountData';
import usePassword from '../../store/usePassword';
import useWallet from '../../store/useWallet';
import { HexString } from '../../types/common';
import { AccountWithAddress, SafeKeyWithType } from '../../types/wallet';
import {
  isMultiSigAccount,
  isSingleSigAccount,
  isVaultAccount,
  isVestingAccount,
} from '../../utils/account';
import { fromBase64 } from '../../utils/base64';
import { getWords } from '../../utils/bech32';
import { fromHexString, toHexString } from '../../utils/hexString';
import { formatSmidge } from '../../utils/smh';
import {
  getMethodName,
  getTemplateNameByKey,
  MethodSelectors,
  MultiSigSpawnArguments,
  SingleSigSpawnArguments,
  TemplateMethodsMap,
  VestingSpawnArguments,
} from '../../utils/templates';
import { computeAddress, getEmptySignature } from '../../utils/wallet';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';

import ConfirmationModal, { ConfirmationData } from './ConfirmationModal';
import Drain from './Drain';
import MultiSigSpawn from './MultiSigSpawn';
import {
  DrainSchema,
  FormSchema,
  FormValues,
  MultiSigSpawnSchema,
  SingleSigSpawnSchema,
  SpendSchema,
  VaultSpawnSchema,
} from './schemas';
import SingleSigSpawn from './SingleSigSpawn';
import Spend from './Spend';
import VaultSpawn from './VaultSpawn';

type SendTxModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AnyArguments =
  | SpendArguments
  | SingleSigSpawnArgumentsTx
  | MultiSigSpawnArgumentsTx
  | VaultSpawnArgumentsTx
  | VestingSpawnArgumentsTx
  | DrainArguments;
type TxData = ConfirmationData & {
  description: string;
  Arguments: AnyArguments;
};

function SendTxModal({ isOpen, onClose }: SendTxModalProps): JSX.Element {
  const { wallet } = useWallet();
  const { withPassword } = usePassword();
  const { isSpawnedAccount, getAccountData } = useAccountData();
  const hrp = useCurrentHRP();
  const genesisID = useCurrentGenesisID();
  const currerntAccount = useCurrentAccount(hrp);
  const accountsList = useAccountsList(hrp);
  const isSpawned = pipe(
    O.zip(genesisID, currerntAccount),
    O.mapWithDefault(false, ([genId, acc]) =>
      isSpawnedAccount(genId, acc.address)
    )
  );
  const accountState = pipe(
    O.zip(genesisID, currerntAccount),
    O.flatMap(([genId, acc]) => getAccountData(genId, acc.address)),
    O.mapWithDefault(
      {
        current: { balance: '0', nonce: '0' },
        projected: { balance: '0', nonce: '0' },
      },
      (acc) => acc.state
    )
  );

  const {
    watch,
    register,
    unregister,
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });
  const selectedMethod = watch('payload.methodSelector');
  const signTx = useSignSingleSig();
  const publishTx = useSubmitTx();
  const { refreshData } = useDataRefresher();
  const estimateGas = useEstimateGas();
  const { setTransactions } = useAccountData();

  const confirmationModal = useDisclosure();
  const [txData, setTxData] = useState<null | TxData>(null);
  const [estimatedGas, setEstimatedGas] = useState<null | bigint>(null);

  useEffect(() => {
    // Update template address when the current account changes
    if (currerntAccount) {
      setValue(
        'templateAddress',
        currerntAccount.templateAddress as StdTemplateKeys
      );
    }
  }, [currerntAccount, setValue]);

  const methodOptions = useMemo(
    () =>
      [
        {
          value: MethodSelectors.SelfSpawn,
          label: 'Self Spawn',
          disabled: isSpawned,
        },
        { value: MethodSelectors.Spend, label: 'Spend', disabled: !isSpawned },
        { value: MethodSelectors.Drain, label: 'Drain', disabled: !isSpawned },
      ].filter(
        ({ value }) =>
          (currerntAccount &&
            TemplateMethodsMap[
              currerntAccount.templateAddress as StdTemplateKeys
            ]?.includes(value)) ||
          false
      ),
    [isSpawned, currerntAccount]
  );

  useEffect(() => {
    // Automatically switch between methods if the account is spawned or not
    if (
      getValues().payload.methodSelector === MethodSelectors.SelfSpawn &&
      isSpawned
    ) {
      setValue(
        'payload.methodSelector',
        methodOptions.find((opt) => !opt.disabled)?.value ??
          MethodSelectors.SelfSpawn
      );
    }
    if (
      getValues().payload.methodSelector !== MethodSelectors.SelfSpawn &&
      !isSpawned
    ) {
      setValue('payload.methodSelector', MethodSelectors.SelfSpawn);
    }
  }, [setValue, isSpawned, methodOptions, getValues]);

  useEffect(() => {
    setValue('nonce', parseInt(accountState.projected.nonce, 10));
  }, [setValue, accountState]);

  const close = () => {
    setTxData(null);
    clearErrors();
    onClose();
  };

  const updateEstimatedGas = async (
    encodedTx: Uint8Array,
    signs: 0 | number
  ) => {
    if (signs === 0) {
      // It is a single sig
      const sig = getEmptySignature();
      const tx = SingleSigTemplate.methods[0].sign(encodedTx, sig);
      const gas = BigInt(await estimateGas(tx));
      setEstimatedGas(gas);
      return;
    }
    // Multi sig
    const sig = new Array(signs)
      .fill(getEmptySignature())
      .map((Sig, Ref) => ({ Ref: BigInt(Ref), Sig }));
    const tx = MultiSigTemplate.methods[0].sign(encodedTx, sig);
    const gas = BigInt(await estimateGas(tx));
    setEstimatedGas(gas);
  };

  const submit = handleSubmit(async (data) => {
    if (!currerntAccount) {
      throw new Error('No account selected');
    }

    const principal = computeAddress(
      hrp,
      data.templateAddress,
      currerntAccount.spawnArguments
    );
    const pinripalBytes = getWords(principal);

    switch (data.payload.methodSelector) {
      case StdMethods.Spawn: {
        if (data.templateAddress === StdPublicKeys.SingleSig) {
          const args = SingleSigSpawnSchema.parse(data.payload);
          const Arguments = {
            PublicKey: fromHexString(args.PublicKey),
          };
          const encoded = SingleSigTemplate.methods[StdMethods.Spawn].encode(
            pinripalBytes,
            {
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Arguments,
            }
          );

          const spawnAccount =
            accountsList.find(
              (acc) =>
                isSingleSigAccount(acc) &&
                acc.spawnArguments.PublicKey === args.PublicKey
            )?.displayName || 'external key';

          const eligibleKeys = (wallet?.keychain || []).filter(
            (kp) => kp.publicKey === args.PublicKey
          );

          setTxData({
            principal,
            form: data,
            encoded,
            eligibleKeys,
            description: `Spawn ${getTemplateNameByKey(
              data.templateAddress
            )} account using ${spawnAccount}`,
            Arguments,
          });
          updateEstimatedGas(encoded, 0);
        }
        if (
          data.templateAddress === StdPublicKeys.MultiSig ||
          data.templateAddress === StdPublicKeys.Vesting
        ) {
          const args = MultiSigSpawnSchema.parse(data.payload);
          const Template =
            data.templateAddress === StdPublicKeys.Vesting
              ? VestingTemplate
              : MultiSigTemplate;
          const Arguments = {
            Required: BigInt(args.Required),
            PublicKeys: args.PublicKeys.map(fromHexString),
          };
          const encoded = Template.methods[StdMethods.Spawn].encode(
            pinripalBytes,
            {
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Arguments,
            }
          );

          const eligibleKeys = (wallet?.keychain || []).filter((kp) =>
            args.PublicKeys.includes(kp.publicKey)
          );

          setTxData({
            principal,
            form: data,
            encoded,
            eligibleKeys,
            description: `Spawn ${getTemplateNameByKey(
              data.templateAddress
            )} account: ${currerntAccount.displayName}`,
            Arguments,
          });
          updateEstimatedGas(encoded, args.Required);
        }
        if (data.templateAddress === StdPublicKeys.Vault) {
          const args = VaultSpawnSchema.parse(data.payload);
          const Arguments = {
            Owner: getWords(args.Owner),
            TotalAmount: BigInt(args.TotalAmount),
            InitialUnlockAmount: BigInt(args.InitialUnlockAmount),
            VestingStart: BigInt(args.VestingStart),
            VestingEnd: BigInt(args.VestingEnd),
          };
          const encoded = VaultTemplate.methods[StdMethods.Spawn].encode(
            pinripalBytes,
            {
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Arguments,
            }
          );

          const eligibleKeys: SafeKeyWithType[] = []; // TODO

          setTxData({
            principal,
            form: data,
            encoded,
            eligibleKeys,
            description: `Spawn ${getTemplateNameByKey(
              data.templateAddress
            )} account: ${currerntAccount.displayName}`,
            Arguments,
          });
          updateEstimatedGas(encoded, 0);
        }
        break;
      }
      case StdMethods.Spend: {
        if (data.templateAddress === StdPublicKeys.SingleSig) {
          const args = SpendSchema.parse(data.payload);
          const Arguments = {
            Amount: BigInt(args.Amount),
            Destination: getWords(args.Destination),
          };
          const encoded = SingleSigTemplate.methods[StdMethods.Spend].encode(
            pinripalBytes,
            {
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Arguments,
            }
          );

          const curAcc =
            currerntAccount as AccountWithAddress<SingleSigSpawnArguments>;
          const eligibleKeys = (wallet?.keychain || []).filter(
            (kp) => kp.publicKey === curAcc.spawnArguments.PublicKey
          );

          setTxData({
            principal,
            form: data,
            encoded,
            eligibleKeys,
            description: `Send ${formatSmidge(args.Amount)} to ${
              args.Destination
            }`,
            Arguments,
          });
          updateEstimatedGas(encoded, 0);
        }
        if (data.templateAddress === StdPublicKeys.MultiSig) {
          const args = SpendSchema.parse(data.payload);
          const Arguments = {
            Amount: BigInt(args.Amount),
            Destination: getWords(args.Destination),
          };
          const encoded = MultiSigTemplate.methods[StdMethods.Spend].encode(
            pinripalBytes,
            {
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Arguments,
            }
          );

          // TODO
          const curAcc =
            currerntAccount as AccountWithAddress<MultiSigSpawnArguments>;
          const curKeys = curAcc.spawnArguments.PublicKeys;
          const eligibleKeys = (wallet?.keychain || []).filter((kp) =>
            curKeys.includes(kp.publicKey)
          );

          setTxData({
            principal,
            form: data,
            encoded,
            eligibleKeys,
            description: `Send ${formatSmidge(args.Amount)} to ${
              args.Destination
            }`,
            Arguments,
          });
          updateEstimatedGas(encoded, curAcc.spawnArguments.Required);
        }

        if (data.templateAddress === StdPublicKeys.Vault) {
          const args = SpendSchema.parse(data.payload);
          const Arguments = {
            Amount: BigInt(args.Amount),
            Destination: getWords(args.Destination),
          };
          const encoded = VaultTemplate.methods[StdMethods.Spend].encode(
            pinripalBytes,
            {
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Arguments,
            }
          );

          const curAcc =
            currerntAccount as AccountWithAddress<SingleSigSpawnArguments>;
          const eligibleKeys = (wallet?.keychain || []).filter(
            (kp) => kp.publicKey === curAcc.spawnArguments.PublicKey
          );

          setTxData({
            principal,
            form: data,
            encoded,
            eligibleKeys,
            description: `Spawn ${formatSmidge(args.Amount)}`,
            Arguments,
          });
          updateEstimatedGas(encoded, 0);
        }
        break;
      }
      case StdMethods.Drain: {
        if (data.templateAddress === StdPublicKeys.Vesting) {
          const args = DrainSchema.parse(data.payload);
          const Arguments = {
            Vault: getWords(args.Vault),
            Amount: BigInt(args.Amount),
            Destination: getWords(args.Destination),
          };
          const encoded = VestingTemplate.methods[StdMethods.Drain].encode(
            pinripalBytes,
            {
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Arguments,
            }
          );

          // TODO
          const eligibleKeys = (wallet?.keychain || []).filter(
            (kp) => kp.publicKey === principal
          );

          setTxData({
            principal,
            form: data,
            encoded,
            eligibleKeys,
            description: `Drain ${formatSmidge(args.Amount)} from ${
              args.Vault
            } to ${args.Destination}`,
            Arguments,
          });
          const curAcc =
            currerntAccount as AccountWithAddress<VestingSpawnArguments>;
          updateEstimatedGas(encoded, curAcc.spawnArguments.Required);
        }
        break;
      }
      default: {
        throw new Error('Invalid method selector');
      }
    }

    confirmationModal.onOpen();
  });

  const signAndPublish = async (
    signWith: HexString,
    externalSignature?: HexString
  ) => {
    if (!txData) {
      throw new Error('Cannot sign and publish unknown transaction');
    }
    if (!genesisID) {
      throw new Error(
        // eslint-disable-next-line max-len
        'Cannot sign and publish transaction: No Genesis ID, please connect to the network first'
      );
    }

    // TODO: Support multisig
    const signature = !externalSignature
      ? await withPassword(
          (password) => signTx(txData.encoded, signWith, password),
          'Enter password to sign transaction',
          txData.description
        )
      : fromHexString(externalSignature);

    if (signature) {
      const signedTx = SingleSigTemplate.methods[0].sign(
        txData.encoded,
        signature
      );
      try {
        const txId = await publishTx(signedTx);
        // eslint-disable-next-line no-console
        console.log('Published tx:', txId);
        setTransactions(genesisID, [
          {
            id: toHexString(fromBase64(txId), true),
            principal: txData.principal,
            nonce: {
              counter: String(txData.form.nonce),
              bitfield: 0,
            },
            gas: {
              maxGas: String(estimatedGas),
              price: String(txData.form.gasPrice),
            },
            template: {
              address: txData.form.templateAddress,
              method: txData.form.payload.methodSelector,
              name: getTemplateNameByKey(txData.form.templateAddress),
              methodName: getMethodName(txData.form.payload.methodSelector),
            },
            layer: 0,
            parsed: txData.Arguments,
            state: 'TRANSACTION_STATE_MEMPOOL',
          },
        ]);
        setTxData(null);
        refreshData();
        confirmationModal.onClose();
        close();
      } catch (err) {
        const message =
          err instanceof Error
            ? err?.message
            : 'Cannot publish transaction by unknown reason';
        setError('root', { message });
        setTxData(null);
        confirmationModal.onClose();
      }
    }
  };

  const renderTemplateSpecificFields = (acc: AccountWithAddress) => {
    switch (acc.templateAddress) {
      case StdPublicKeys.Vault: {
        if (!isVaultAccount(acc)) {
          throw new Error('Invalid account type for Vault template');
        }
        return selectedMethod === StdMethods.Spawn ? (
          <VaultSpawn
            register={register}
            unregister={unregister}
            spawnArguments={acc.spawnArguments}
          />
        ) : (
          <Spend
            register={register}
            unregister={unregister}
            errors={errors}
            isSubmitted={isSubmitted}
            accounts={accountsList}
            setValue={setValue}
            getValues={getValues}
          />
        );
      }
      case StdPublicKeys.Vesting: {
        if (!isVestingAccount(acc)) {
          throw new Error('Invalid account type for Vesting template');
        }
        return selectedMethod === StdMethods.Spawn ? (
          <MultiSigSpawn
            register={register}
            unregister={unregister}
            spawnArguments={acc.spawnArguments}
          />
        ) : (
          <Drain
            register={register}
            unregister={unregister}
            errors={errors}
            isSubmitted={isSubmitted}
            accounts={accountsList}
            setValue={setValue}
            getValues={getValues}
          />
        );
      }
      case StdPublicKeys.MultiSig: {
        if (!isMultiSigAccount(acc)) {
          throw new Error('Invalid account type for MultiSig template');
        }
        return selectedMethod === StdMethods.Spawn ? (
          <MultiSigSpawn
            register={register}
            unregister={unregister}
            spawnArguments={acc.spawnArguments}
          />
        ) : (
          <Spend
            register={register}
            unregister={unregister}
            errors={errors}
            isSubmitted={isSubmitted}
            accounts={accountsList}
            setValue={setValue}
            getValues={getValues}
          />
        );
      }
      case StdPublicKeys.SingleSig: {
        if (!isSingleSigAccount(acc)) {
          throw new Error('Invalid account type for SingleSig template');
        }
        return selectedMethod === StdMethods.Spawn ? (
          <SingleSigSpawn
            register={register}
            unregister={unregister}
            spawnArguments={acc.spawnArguments}
          />
        ) : (
          <Spend
            register={register}
            unregister={unregister}
            errors={errors}
            isSubmitted={isSubmitted}
            accounts={accountsList}
            setValue={setValue}
            getValues={getValues}
          />
        );
      }
      default: {
        return <Text color="red">Invalid template address</Text>;
      }
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={close} isCentered>
        <Form control={control}>
          <input
            type="hidden"
            {...register('templateAddress', {
              value: O.mapWithDefault(
                currerntAccount,
                StdPublicKeys.SingleSig,
                (acc) => acc.templateAddress as StdTemplateKeys
              ),
            })}
          />
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader pb={0}>Send a transaction</ModalHeader>
            <ModalBody minH={0}>
              {errors.root?.message && (
                <Text mb={2} color="red">
                  {errors.root.message}
                </Text>
              )}
              <FormSelect
                register={register('payload.methodSelector', {
                  valueAsNumber: true,
                })}
                options={methodOptions.map(({ value, ...rest }) => ({
                  value: String(value),
                  ...rest,
                }))}
                errors={errors}
                isSubmitted={isSubmitted}
              />
              {O.mapWithDefault(
                currerntAccount,
                <Text color="red">
                  None of account is selected. Please switch to any account
                  first.
                </Text>,
                (curAcc) => (
                  <Card variant="outline">
                    <CardBody pt={2} pr={3} pb={1} pl={3}>
                      {renderTemplateSpecificFields(curAcc)}
                    </CardBody>
                  </Card>
                )
              )}
              <Flex mt={0}>
                <Box mr={2} w="50%">
                  <FormInput
                    label="Gas Price"
                    inputProps={{ type: 'number' }}
                    register={register('gasPrice', {
                      value: 1,
                      valueAsNumber: true,
                    })}
                    errors={errors}
                    isSubmitted={isSubmitted}
                    inputAddon={
                      <InputRightElement mr={2}>
                        <Text fontSize="xs">Smidge</Text>
                      </InputRightElement>
                    }
                  />
                </Box>
                <Box ml={2} w="50%">
                  <FormInput
                    label="Nonce"
                    inputProps={{ type: 'number' }}
                    register={register('nonce', {
                      value: 1,
                      valueAsNumber: true,
                      required: 'Nonce is required',
                      min: {
                        value: 1,
                        // eslint-disable-next-line max-len
                        message: 'Nonce must be a positive number or zero',
                      },
                    })}
                    errors={errors}
                    isSubmitted={isSubmitted}
                  />
                </Box>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={submit} ml={2}>
                Next
              </Button>
            </ModalFooter>
          </ModalContent>
        </Form>
      </Modal>
      {txData && (
        <ConfirmationModal
          {...txData}
          estimatedGas={estimatedGas}
          isOpen={confirmationModal.isOpen}
          onClose={confirmationModal.onClose}
          onSubmit={signAndPublish}
        />
      )}
    </>
  );
}

export default SendTxModal;
