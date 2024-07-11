import fileDownload from 'js-file-download';
import { useEffect, useMemo, useState } from 'react';
import { FieldPath, FieldPathValue, Form, useForm } from 'react-hook-form';

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
  Codecs,
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
import { MultiSigPart, SingleSig } from '@spacemesh/sm-codec/lib/codecs';
import { SpawnArguments } from '@spacemesh/sm-codec/lib/std/singlesig';

import useDataRefresher from '../../hooks/useDataRefresher';
import {
  useCurrentGenesisID,
  useCurrentHRP,
} from '../../hooks/useNetworkSelectors';
import {
  useEstimateGas,
  useSignTx,
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
import { AccountWithAddress } from '../../types/wallet';
import {
  extractEligibleKeys,
  extractRequiredSignatures,
  isAnyMultiSig,
  isMultiSigAccount,
  isSingleSigAccount,
  isVaultAccount,
  isVestingAccount,
} from '../../utils/account';
import { fromBase64 } from '../../utils/base64';
import { generateAddress, getWords } from '../../utils/bech32';
import { fromHexString, toHexString } from '../../utils/hexString';
import { formatSmidge } from '../../utils/smh';
import {
  getMethodName,
  getTemplateMethod,
  getTemplateNameByKey,
  MethodSelectors,
  MultiSigSpawnArguments,
  TemplateMethodsMap,
} from '../../utils/templates';
import { computeAddress, getEmptySignature } from '../../utils/wallet';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import TxFileReader from '../TxFileReader';

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
import SpawnAnotherAccount from './SpawnAnotherAccount';
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
  const signTx = useSignTx();
  const publishTx = useSubmitTx();
  const { refreshData } = useDataRefresher();
  const estimateGas = useEstimateGas();
  const { setTransactions } = useAccountData();

  const confirmationModal = useDisclosure();
  const [txData, setTxData] = useState<null | TxData>(null);
  const [estimatedGas, setEstimatedGas] = useState<null | bigint>(null);

  const [importErrors, setImportErrors] = useState('');

  useEffect(() => {
    // Update template address when the current account changes
    if (currerntAccount) {
      setValue(
        'templateAddress',
        currerntAccount.templateAddress as StdTemplateKeys
      );
    }
  }, [currerntAccount, setValue]);

  const isCurrentVaultAccount = O.mapWithDefault(
    currerntAccount,
    false,
    isVaultAccount
  );

  const methodOptions = useMemo(
    () =>
      [
        {
          value: MethodSelectors.Spawn,
          label: isSpawned ? 'Spawn' : 'Self Spawn',
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
      getValues().payload.methodSelector === MethodSelectors.Spawn &&
      isSpawned
    ) {
      setValue(
        'payload.methodSelector',
        methodOptions.find(
          (opt) => opt.value !== MethodSelectors.Spawn && !opt.disabled
        )?.value ?? MethodSelectors.Spawn
      );
    }
    if (
      getValues().payload.methodSelector !== MethodSelectors.Spawn &&
      !isSpawned
    ) {
      setValue('payload.methodSelector', MethodSelectors.Spawn);
    }
  }, [setValue, isSpawned, methodOptions, getValues]);

  useEffect(() => {
    setValue('nonce', parseInt(accountState.projected.nonce, 10));
  }, [setValue, accountState]);

  const close = () => {
    setTxData(null);
    setImportErrors('');
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

  const submit = handleSubmit(
    async (data) => {
      if (!currerntAccount) {
        throw new Error('No account selected');
      }

      const principal = computeAddress(
        hrp,
        currerntAccount.templateAddress as StdTemplateKeys,
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

            setTxData({
              principal,
              form: data,
              encoded,
              eligibleKeys: extractEligibleKeys(
                currerntAccount,
                accountsList,
                wallet?.keychain ?? []
              ),
              description: `Spawn ${getTemplateNameByKey(
                data.templateAddress
              )} account using ${spawnAccount}`,
              Arguments,
              isMultiSig: isAnyMultiSig(currerntAccount),
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

            setTxData({
              principal,
              form: data,
              encoded,
              eligibleKeys: extractEligibleKeys(
                currerntAccount,
                accountsList,
                wallet?.keychain ?? []
              ),
              description: `Spawn ${getTemplateNameByKey(
                data.templateAddress
              )} account: ${currerntAccount.displayName}`,
              Arguments,
              isMultiSig: isAnyMultiSig(currerntAccount),
              required: args.Required,
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

            setTxData({
              principal,
              form: data,
              encoded,
              eligibleKeys: extractEligibleKeys(
                currerntAccount,
                accountsList,
                wallet?.keychain ?? []
              ),
              description: `Spawn ${getTemplateNameByKey(
                data.templateAddress
              )} account: ${currerntAccount.displayName}`,
              Arguments,
              isMultiSig: isAnyMultiSig(currerntAccount),
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

            setTxData({
              principal,
              form: data,
              encoded,
              eligibleKeys: extractEligibleKeys(
                currerntAccount,
                accountsList,
                wallet?.keychain ?? []
              ),
              description: `Send ${formatSmidge(args.Amount)} to ${
                args.Destination
              }`,
              Arguments,
              isMultiSig: isAnyMultiSig(currerntAccount),
            });
            updateEstimatedGas(encoded, 0);
          }
          if (
            data.templateAddress === StdPublicKeys.MultiSig ||
            data.templateAddress === StdPublicKeys.Vesting
          ) {
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

            const required = extractRequiredSignatures(currerntAccount);
            setTxData({
              principal,
              form: data,
              encoded,
              eligibleKeys: extractEligibleKeys(
                currerntAccount,
                accountsList,
                wallet?.keychain ?? []
              ),
              description: `Send ${formatSmidge(args.Amount)} to ${
                args.Destination
              }`,
              Arguments,
              isMultiSig: isAnyMultiSig(currerntAccount),
              required,
            });
            updateEstimatedGas(encoded, required);
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

            setTxData({
              principal,
              form: data,
              encoded,
              eligibleKeys: extractEligibleKeys(
                currerntAccount,
                accountsList,
                wallet?.keychain ?? []
              ),
              description: `Spawn ${formatSmidge(args.Amount)}`,
              Arguments,
              isMultiSig: isAnyMultiSig(currerntAccount),
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

            const required = extractRequiredSignatures(currerntAccount);
            setTxData({
              principal,
              form: data,
              encoded,
              eligibleKeys: extractEligibleKeys(
                currerntAccount,
                accountsList,
                wallet?.keychain ?? []
              ),
              description: `Drain ${formatSmidge(args.Amount)} from ${
                args.Vault
              } to ${args.Destination}`,
              Arguments,
              isMultiSig: isAnyMultiSig(currerntAccount),
              required,
            });
            updateEstimatedGas(encoded, required);
          }
          break;
        }
        default: {
          throw new Error('Invalid method selector');
        }
      }

      confirmationModal.onOpen();
    },
    (x) => {
      // eslint-disable-next-line no-console
      console.error('Cannot submit form', x);
    }
  );

  const sign = async (signWith: HexString, externalSignature?: HexString) => {
    if (O.isNone(currerntAccount)) {
      throw new Error(
        'Cannot sign transaction: please choose an account first.'
      );
    }
    if (!txData) {
      throw new Error('Cannot sign unknown transaction');
    }
    if (!genesisID) {
      throw new Error(
        // eslint-disable-next-line max-len
        'Cannot sign transaction: No Genesis ID, please connect to the network first'
      );
    }

    const signature = !externalSignature
      ? await withPassword(
          (password) => signTx(txData.encoded, signWith, password),
          'Enter password to sign transaction',
          txData.description
        )
      : fromHexString(externalSignature);

    if (signature) {
      if (
        currerntAccount.templateAddress === StdPublicKeys.MultiSig ||
        currerntAccount.templateAddress === StdPublicKeys.Vesting
      ) {
        const keys = (currerntAccount.spawnArguments as MultiSigSpawnArguments)
          .PublicKeys;
        const ref = keys.findIndex((k) => k === signWith);
        const existingSignatures = (txData.signatures as MultiSigPart[]) || [];
        const sortedSignatures = [
          ...existingSignatures,
          {
            Ref: BigInt(ref),
            Sig: signature,
          },
        ].sort((a, b) => Number(a.Ref - b.Ref));
        return MultiSigTemplate.methods[0].sign(
          txData.encoded,
          sortedSignatures
        );
      }
      // SingleSig, also valid for Vault account
      return SingleSigTemplate.methods[0].sign(txData.encoded, signature);
    }
    return null;
  };

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
    const signedTx = await sign(signWith, externalSignature);
    if (signedTx) {
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

  const exportTx = async (
    signWith: HexString | null,
    externalSignature?: HexString
  ) => {
    if (!txData) {
      throw new Error('Cannot export unknown transaction');
    }
    if (signWith && !genesisID) {
      throw new Error(
        // eslint-disable-next-line max-len
        'Cannot sign and export transaction: No Genesis ID, please connect to the network first'
      );
    }

    const tx = signWith
      ? await sign(signWith, externalSignature)
      : txData.encoded;

    if (tx) {
      const hex = toHexString(tx, true);
      fileDownload(
        hex,
        `tx-${signWith ? 'signed' : 'unsigned'}-${hex.slice(-6)}.hex`,
        'text/plain'
      );
    }
  };

  const importTx = async (txs: HexString[]) => {
    if (O.isNone(currerntAccount)) {
      throw new Error(
        'Cannot import a transaction: please choose an account first.'
      );
    }

    const headers = txs.map(Codecs.TxHeader.dec);
    if (!headers[0]) {
      throw new Error(
        // eslint-disable-next-line max-len
        'No valid transactions found. Please choose another transaction file(s).'
      );
    }
    const expectedPrincipal = toHexString(getWords(currerntAccount.address));
    const validPrincipal = headers.every(
      (h) => toHexString(h.Principal) === expectedPrincipal
    );

    if (!validPrincipal) {
      throw new Error(
        // eslint-disable-next-line max-len
        'Cannot import a transaction: one or more transactions belongs to another account'
      );
      return;
    }

    const method = Number(headers[0].MethodSelector) as MethodSelectors;
    const tpl = getTemplateMethod(currerntAccount.templateAddress, method);
    const parsed = txs.map((x) => tpl.decode(fromHexString(x)));
    const rawTx = parsed[0];

    if (!rawTx) {
      throw new Error('Cannot parse imported transaction');
    }

    const rawPayload = rawTx.Payload as Parameters<typeof tpl.encode>[1];
    const withoutSignatures = parsed.map((x) =>
      tpl.encode(
        rawTx.Principal,
        // TODO: TS cannot infer the type properly
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        x.Payload
      )
    );
    if (
      !withoutSignatures.every(
        (x) => toHexString(x) === toHexString(withoutSignatures[0] ?? [])
      )
    ) {
      throw new Error('All imported transactions should be the same');
    }

    const encoded = tpl.encode(
      getWords(currerntAccount.address),
      // TODO: TS cannot infer the type of `rawPayload` here
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rawPayload
    );

    const convertToFormValues = (tx: typeof rawTx): FormValues => {
      const templateAddress =
        currerntAccount.templateAddress as StdTemplateKeys;
      switch (method) {
        case MethodSelectors.Spawn: {
          if (templateAddress === StdPublicKeys.SingleSig) {
            const args = tx.Payload.Arguments as SpawnArguments;
            return {
              templateAddress,
              nonce: Number(tx.Payload.Nonce),
              gasPrice: Number(tx.Payload.GasPrice),
              payload: {
                methodSelector: method,
                PublicKey: toHexString(args.PublicKey),
              },
            };
          }
          if (
            templateAddress === StdPublicKeys.MultiSig ||
            templateAddress === StdPublicKeys.Vesting
          ) {
            const args = tx.Payload.Arguments as MultiSigSpawnArgumentsTx;
            return {
              templateAddress,
              nonce: Number(tx.Payload.Nonce),
              gasPrice: Number(tx.Payload.GasPrice),
              payload: {
                methodSelector: method,
                Required: Number(args.Required),
                PublicKeys: args.PublicKeys.map((x) => toHexString(x)),
              },
            };
          }
          if (templateAddress === StdPublicKeys.Vault) {
            const args = tx.Payload.Arguments as VaultSpawnArgumentsTx;
            return {
              templateAddress,
              nonce: Number(tx.Payload.Nonce),
              gasPrice: Number(tx.Payload.GasPrice),
              payload: {
                methodSelector: method,
                Owner: generateAddress(args.Owner, hrp),
                TotalAmount: args.TotalAmount.toString(),
                InitialUnlockAmount: args.InitialUnlockAmount.toString(),
                VestingStart: Number(args.VestingStart),
                VestingEnd: Number(args.VestingEnd),
              },
            };
          }
          throw new Error(
            `Template ${templateAddress} does not support SelfSpawn transaction`
          );
        }
        case MethodSelectors.Spend: {
          if (
            templateAddress === StdPublicKeys.SingleSig ||
            templateAddress === StdPublicKeys.MultiSig ||
            templateAddress === StdPublicKeys.Vesting ||
            templateAddress === StdPublicKeys.Vault
          ) {
            const args = tx.Payload.Arguments as SpendArguments;
            return {
              templateAddress,
              nonce: Number(tx.Payload.Nonce),
              gasPrice: Number(tx.Payload.GasPrice),
              payload: {
                methodSelector: method,
                Amount: args.Amount.toString(),
                Destination: generateAddress(args.Destination, hrp),
              },
            };
          }
          throw new Error(
            `Template ${templateAddress} does not support Spend transaction`
          );
        }
        case MethodSelectors.Drain: {
          if (templateAddress === StdPublicKeys.Vesting) {
            const args = tx.Payload.Arguments as DrainArguments;
            return {
              templateAddress,
              nonce: Number(tx.Payload.Nonce),
              gasPrice: Number(tx.Payload.GasPrice),
              payload: {
                methodSelector: method,
                Vault: generateAddress(args.Vault, hrp),
                Amount: args.Amount.toString(),
                Destination: generateAddress(args.Destination, hrp),
              },
            };
          }
          throw new Error(
            `Template ${templateAddress} does not support SelfSpawn transaction`
          );
        }
        default: {
          throw new Error(`Unknown method: ${method}`);
        }
      }
    };

    const extractSignatures = (): undefined | SingleSig | MultiSigPart[] => {
      // Extract SingleSig
      if (
        currerntAccount.templateAddress === StdPublicKeys.SingleSig ||
        currerntAccount.templateAddress === StdPublicKeys.Vault
      ) {
        return parsed.reduce(
          (acc, next) => next.Signature || acc,
          undefined as undefined | SingleSig
        );
      }
      // Extract MultiSig parts
      const sigs = new Set<MultiSigPart>();
      parsed.forEach((next) => {
        if (next.Signatures) {
          next.Signatures.forEach((nextSig) => {
            sigs.add(nextSig);
          });
        }
      });
      const result = Array.from(sigs);
      return result.length > 0 ? result : undefined;
    };
    const extractRefs = (
      signatures: undefined | SingleSig | MultiSigPart[]
    ) => {
      if (
        currerntAccount.templateAddress === StdPublicKeys.SingleSig ||
        currerntAccount.templateAddress === StdPublicKeys.Vault
      ) {
        return undefined;
      }
      return (signatures as MultiSigPart[]).map(({ Ref }) => Number(Ref));
    };

    const form = convertToFormValues(rawTx);

    const required = extractRequiredSignatures(currerntAccount);
    const signatures = extractSignatures();
    const refs = extractRefs(signatures);
    // Set transaction data
    setTxData({
      principal: currerntAccount.address,
      form,
      encoded,
      eligibleKeys: extractEligibleKeys(
        currerntAccount,
        accountsList,
        wallet?.keychain ?? [],
        refs
      ),
      description: `Sign and publish ${getTemplateNameByKey(
        currerntAccount.templateAddress
      )}.${getMethodName(method)} transaction`,
      Arguments: rawPayload.Arguments,
      signatures,
      isMultiSig: isAnyMultiSig(currerntAccount),
      required,
    });

    // Update form values
    Object.entries(form).forEach(([key, value]) => {
      if (value === Object) {
        Object.entries(value).forEach(([k, v]) => {
          setValue(
            `${key}.${k}` as FieldPath<FormValues>,
            v as FieldPathValue<FormValues, FieldPath<FormValues>>
          );
        });
      } else {
        setValue(key as FieldPath<FormValues>, value);
      }
    });

    updateEstimatedGas(encoded, required);
    confirmationModal.onOpen();
  };

  const handleImportTx = (txs: HexString[]) => {
    importTx(txs)
      .then(() => {
        setImportErrors('');
      })
      .catch(showImportError);
  };

  const showImportError = (err: Error) => {
    setImportErrors(err.message);
  };

  const renderSpawnOrSelfSpawn = (defaultComponent: JSX.Element) =>
    isSpawned ? (
      <SpawnAnotherAccount
        accounts={accountsList.filter((acc) => acc !== currerntAccount)}
        register={register}
        unregister={unregister}
        setValue={setValue}
      />
    ) : (
      defaultComponent
    );

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
            watch={watch}
          />
        );
      }
      case StdPublicKeys.Vesting: {
        if (!isVestingAccount(acc)) {
          throw new Error('Invalid account type for Vesting template');
        }
        // eslint-disable-next-line no-nested-ternary
        return selectedMethod === StdMethods.Spawn ? (
          renderSpawnOrSelfSpawn(
            <MultiSigSpawn
              register={register}
              unregister={unregister}
              spawnArguments={acc.spawnArguments}
            />
          )
        ) : selectedMethod === StdMethods.Spend ? (
          <Spend
            register={register}
            unregister={unregister}
            errors={errors}
            isSubmitted={isSubmitted}
            accounts={accountsList}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
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
            watch={watch}
          />
        );
      }
      case StdPublicKeys.MultiSig: {
        if (!isMultiSigAccount(acc)) {
          throw new Error('Invalid account type for MultiSig template');
        }
        return selectedMethod === StdMethods.Spawn ? (
          renderSpawnOrSelfSpawn(
            <MultiSigSpawn
              register={register}
              unregister={unregister}
              spawnArguments={acc.spawnArguments}
            />
          )
        ) : (
          <Spend
            register={register}
            unregister={unregister}
            errors={errors}
            isSubmitted={isSubmitted}
            accounts={accountsList}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
          />
        );
      }
      case StdPublicKeys.SingleSig: {
        if (!isSingleSigAccount(acc)) {
          throw new Error('Invalid account type for SingleSig template');
        }
        return selectedMethod === StdMethods.Spawn ? (
          renderSpawnOrSelfSpawn(
            <SingleSigSpawn
              register={register}
              unregister={unregister}
              spawnArguments={acc.spawnArguments}
            />
          )
        ) : (
          <Spend
            register={register}
            unregister={unregister}
            errors={errors}
            isSubmitted={isSubmitted}
            accounts={accountsList}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
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
            <ModalHeader pb={0}>
              Send a transaction
              <Text fontSize="xs" color="gray.400">
                Or you can
                <TxFileReader
                  multiple
                  onRead={handleImportTx}
                  onError={showImportError}
                >
                  <Button
                    variant="link"
                    colorScheme="purple"
                    size="xs"
                    p={1}
                    isDisabled={
                      !!(currerntAccount && isVaultAccount(currerntAccount))
                    }
                  >
                    import a transaction
                  </Button>
                </TxFileReader>
                from file.
              </Text>
              {!!importErrors && (
                <Text mt={2} mb={2} fontSize="xs" color="red">
                  {importErrors}
                </Text>
              )}
            </ModalHeader>
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
                  No account selected. Please switch to an account first. first.
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
                    // eslint-disable-next-line max-len
                    hint="How much to pay for gas: During high network traffic, 
                    transactions with higher gas fees are prioritized."
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
                    // eslint-disable-next-line max-len
                    hint="The number is used only once to ensure each transaction is unique. 
                    It increments automatically, but can also be set manually if needed."
                  />
                </Box>
              </Flex>
              {isCurrentVaultAccount && (
                <Text fontSize="sm" color="orange">
                  Vault account cannot publish any transactions by itself.
                  <br />
                  You have to switch to Vesting account first and then publish
                  transactions from it: Spawn or Drain.
                </Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                onClick={submit}
                ml={2}
                isDisabled={isCurrentVaultAccount}
              >
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
          onExport={exportTx}
        />
      )}
    </>
  );
}

export default SendTxModal;
