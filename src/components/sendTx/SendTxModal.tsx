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
  Athena,
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
import useHardwareWallet from '../../store/useHardwareWallet';
import usePassword from '../../store/usePassword';
import useWallet from '../../store/useWallet';
import { HexString } from '../../types/common';
import { AccountWithAddress, KeyOrigin } from '../../types/wallet';
import {
  extractEligibleKeys,
  extractRequiredSignatures,
  isAnyMultiSig,
  isAthenaWalletAccount,
  isMultiSigAccount,
  isSingleSigAccount,
  isVaultAccount,
  isVestingAccount,
} from '../../utils/account';
import { fromBase64 } from '../../utils/base64';
import { generateAddress, getWords } from '../../utils/bech32';
import { DEFAULT_ACCOUNT_STATES } from '../../utils/constants';
import { fromHexString, toHexString } from '../../utils/hexString';
import { isForeignKey } from '../../utils/keys';
import { formatSmidge } from '../../utils/smh';
import {
  athenaSuffix,
  getMethodName,
  getTemplateMethod,
  getTemplateNameByKey,
  MethodSelectors,
  MultiSigSpawnArguments,
  TemplateMethodsMap,
} from '../../utils/templates';
import { prepareTxForSign } from '../../utils/tx';
import { computeAddress, getEmptySignature } from '../../utils/wallet';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import TxFileReader from '../TxFileReader';

import ConfirmationModal, { ConfirmationData } from './ConfirmationModal';
import Drain from './Drain';
import ExportSuccessModal from './ExportSuccessModal';
import MultiSigSpawn from './MultiSigSpawn';
import {
  AthenaWalletSpawnSchema,
  DrainPayload,
  DrainSchema,
  FormSchema,
  FormValues,
  MultiSigSpawnSchema,
  SingleSigSpawnSchema,
  SpendPayload,
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
  | DrainArguments
  | Athena.Wallet.SpawnArguments
  | Athena.Wallet.SpendArguments;
type TxData = ConfirmationData & {
  description: string;
  Arguments: AnyArguments;
};

function SendTxModal({ isOpen, onClose }: SendTxModalProps): JSX.Element {
  const { wallet } = useWallet();
  const { withPassword } = usePassword();
  const { isSpawnedAccount, getAccountData } = useAccountData();
  const { checkDeviceConnection, connectedDevice, modalWrongDevice } =
    useHardwareWallet();
  const hrp = useCurrentHRP();
  const genesisID = useCurrentGenesisID();
  const currerntAccount = useCurrentAccount(hrp);
  const accountsList = useAccountsList(hrp);
  const [isLedgerRejected, setIsLedgerRejected] = useState(false);
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

  const exportSuccessModal = useDisclosure();
  const [isExportedSigned, setIsExportedSigned] = useState(false);
  const confirmationModal = useDisclosure();
  const [txData, setTxData] = useState<null | TxData>(null);
  const [estimatedGas, setEstimatedGas] = useState<null | bigint>(null);

  const [importErrors, setImportErrors] = useState('');

  useEffect(() => {
    // Update template address when the current account changes
    if (currerntAccount) {
      setValue(
        'templateAddress',
        (currerntAccount.isAthena
          ? athenaSuffix(currerntAccount.templateAddress)
          : currerntAccount.templateAddress) as StdTemplateKeys
      );
    }
  }, [currerntAccount, setValue]);

  const isCurrentVaultAccount = O.mapWithDefault(
    currerntAccount,
    false,
    isVaultAccount
  );

  const insufficientFunds = O.mapWithDefault(accountState, '', (acc) => {
    if (!estimatedGas) {
      return 'Waiting for gas estimation...';
    }

    const tx = getValues();
    const fee =
      estimatedGas *
      BigInt(Number.isNaN(tx.gasPrice) || !tx.gasPrice ? 1 : tx.gasPrice);
    if (BigInt(acc.projected.balance) < fee) {
      return 'You have insufficient funds to pay for gas';
    }
    if (SpendSchema.safeParse(tx.payload).success) {
      // If it is a Spend tx — check if the balance is enough to send the amount
      const txPayload = tx.payload as SpendPayload;
      const res =
        BigInt(acc.projected.balance) >= BigInt(txPayload.Amount) + fee;
      return res ? '' : 'You have insufficient funds to send this amount';
    }
    if (DrainSchema.safeParse(tx.payload).success) {
      // If it is a Drain tx — check that Vault has enough balance to be drained
      const txPayload = tx.payload as DrainPayload;
      return pipe(
        genesisID,
        O.flatMap((genId) => getAccountData(genId, txPayload.Vault)),
        O.mapWithDefault('', (vault) => {
          if (vault.state === DEFAULT_ACCOUNT_STATES) {
            // No account data found — do not block the transaction
            return '';
          }

          const res =
            BigInt(vault.state.projected.balance) >= BigInt(txPayload.Amount);
          return res ? '' : 'The vault has insufficient funds to be drained';
        })
      );
    }
    // In any other case
    return '';
  });

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
    setIsLedgerRejected(false);
    setIsExportedSigned(false);
    clearErrors();
    onClose();
  };

  const onConfirmationModalClose = () => {
    setIsLedgerRejected(false);
    confirmationModal.onClose();
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
        currerntAccount.spawnArguments,
        currerntAccount.isAthena
      );
      const pinripalBytes = getWords(principal);
      const commonProps = {
        eligibleKeys: extractEligibleKeys(
          currerntAccount,
          accountsList,
          wallet?.keychain ?? []
        ),
        isMultiSig: isAnyMultiSig(currerntAccount),
        required: extractRequiredSignatures(currerntAccount),
      };

      switch (data.payload.methodSelector) {
        case StdMethods.Spawn: {
          if (
            currerntAccount.isAthena &&
            data.templateAddress ===
              athenaSuffix(Athena.Wallet.TEMPLATE_PUBKEY_HEX)
          ) {
            const args = AthenaWalletSpawnSchema.parse(data.payload);
            const Arguments = {
              PubKey: fromHexString(args.PublicKey),
            };
            const encoded = Athena.Templates[
              '000000000000000000000000000000000000000000000001'
            ].methods[Athena.Wallet.METHODS_HEX.SPAWN].enc({
              Version: 1n,
              Principal: pinripalBytes,
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Payload: Arguments,
              Signature: null,
            });
            const spawnAccount =
              accountsList.find(
                (acc) =>
                  isAthenaWalletAccount(acc) &&
                  acc.spawnArguments.PublicKey === args.PublicKey
              )?.displayName || 'external key';

            setTxData({
              principal,
              form: data,
              encoded,
              description: `Spawn ${getTemplateNameByKey(
                data.templateAddress
              )} account using ${spawnAccount}`,
              Arguments,
              ...commonProps,
            });
            updateEstimatedGas(encoded, 0);
            break;
          }
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
              description: `Spawn ${getTemplateNameByKey(
                data.templateAddress
              )} account using ${spawnAccount}`,
              Arguments,
              ...commonProps,
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
              description: `Spawn ${getTemplateNameByKey(
                data.templateAddress
              )} account: ${currerntAccount.displayName}`,
              Arguments,
              ...commonProps,
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
              description: `Spawn ${getTemplateNameByKey(
                data.templateAddress
              )} account: ${currerntAccount.displayName}`,
              Arguments,
              ...commonProps,
            });
            updateEstimatedGas(encoded, 0);
          }
          break;
        }
        case StdMethods.Spend: {
          if (
            currerntAccount.isAthena &&
            data.templateAddress ===
              athenaSuffix(Athena.Wallet.TEMPLATE_PUBKEY_HEX)
          ) {
            const args = SpendSchema.parse(data.payload);
            const Arguments = {
              Recipient: getWords(args.Destination),
              Amount: BigInt(args.Amount),
            };
            const encoded = Athena.Templates[
              '000000000000000000000000000000000000000000000001'
            ].methods[Athena.Wallet.METHODS_HEX.SPEND].enc({
              Version: 1n,
              Principal: pinripalBytes,
              Nonce: BigInt(data.nonce),
              GasPrice: BigInt(data.gasPrice),
              Payload: Arguments,
              Signature: null,
            });

            setTxData({
              principal,
              form: data,
              encoded,
              description: `Send ${formatSmidge(args.Amount)} to ${
                args.Destination
              }`,
              Arguments,
              ...commonProps,
            });
            updateEstimatedGas(encoded, 0);
            break;
          }
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
              description: `Send ${formatSmidge(args.Amount)} to ${
                args.Destination
              }`,
              Arguments,
              ...commonProps,
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

            setTxData({
              principal,
              form: data,
              encoded,
              description: `Send ${formatSmidge(args.Amount)} to ${
                args.Destination
              }`,
              Arguments,
              ...commonProps,
            });
            updateEstimatedGas(encoded, commonProps.required);
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
              description: `Spawn ${formatSmidge(args.Amount)}`,
              Arguments,
              ...commonProps,
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

            setTxData({
              principal,
              form: data,
              encoded,
              description: `Drain ${formatSmidge(args.Amount)} from ${
                args.Vault
              } to ${args.Destination}`,
              Arguments,
              ...commonProps,
            });
            updateEstimatedGas(encoded, commonProps.required);
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

    const getSignature = async () => {
      if (!wallet) {
        throw new Error('Cannot sign transaction: Open the wallet first');
      }
      const keyToUse = wallet.keychain.find((k) => k.publicKey === signWith);
      if (isForeignKey(keyToUse) && keyToUse.origin === KeyOrigin.Ledger) {
        if (!(await checkDeviceConnection()) || !connectedDevice) {
          return null;
        }
        const ledgerKey = await connectedDevice.actions.getPubKey(
          keyToUse.path
        );
        if (ledgerKey !== keyToUse.publicKey) {
          modalWrongDevice.onOpen();
          return null;
        }
        // TODO: Remove that Athena kludge
        const dataToSign = currerntAccount.isAthena
          ? txData.encoded
          : prepareTxForSign(genesisID, txData.encoded);

        return connectedDevice.actions
          .signTx(keyToUse.path, dataToSign)
          .catch(() => {
            setIsLedgerRejected(true);
            return null;
          });
      }

      return withPassword(
        (password) =>
          signTx(
            txData.encoded,
            signWith,
            password,
            currerntAccount.isAthena || false
          ),
        'Sign Transaction',
        txData.description
      );
    };

    const signature = externalSignature
      ? fromHexString(externalSignature)
      : await getSignature();

    if (!signature) {
      return null;
    }

    if (
      currerntAccount.templateAddress === StdPublicKeys.MultiSig ||
      currerntAccount.templateAddress === StdPublicKeys.Vesting ||
      currerntAccount.templateAddress === StdPublicKeys.Vault
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
      return MultiSigTemplate.methods[0].sign(txData.encoded, sortedSignatures);
    }

    return SingleSigTemplate.methods[0].sign(txData.encoded, signature);
  };

  const signWithExistingSignatures = (
    tx: Uint8Array,
    signatures: SingleSig | MultiSigPart[]
  ) => {
    if (!currerntAccount) {
      throw new Error('Cannot sign transaction by unknown account');
    }

    if (currerntAccount.templateAddress === StdPublicKeys.SingleSig) {
      return SingleSigTemplate.methods[0].sign(tx, signatures as SingleSig);
    }
    return MultiSigTemplate.methods[0].sign(
      tx,
      (signatures as MultiSigPart[]).sort((a, b) => Number(a.Ref - b.Ref))
    );
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
    const shouldSign =
      !txData.isMultiSig || txData.signatures?.length !== txData.required;

    const signedTx = shouldSign
      ? await sign(signWith, externalSignature)
      : signWithExistingSignatures(txData.encoded, txData.signatures ?? []);

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
              maxGas: estimatedGas ? String(estimatedGas) : '',
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
      return true;
    }
    return false;
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
      confirmationModal.onClose();
      setIsExportedSigned(!!signWith);
      exportSuccessModal.onOpen();
      return true;
    }
    return false;
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
    const templateAddress =
      method === MethodSelectors.Spawn
        ? toHexString(
            Codecs.SpawnTxHeader.dec(txs[0] as HexString).TemplateAddress
          )
        : currerntAccount.templateAddress;
    const tpl = getTemplateMethod(templateAddress, method);
    const parsed = txs.map((x) =>
      tpl.decodeWithoutSignatures(fromHexString(x))
    );
    const rawTx = parsed[0]?.tx;

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
        x.tx.Payload
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
      if (currerntAccount.templateAddress === StdPublicKeys.SingleSig) {
        return parsed.reduce(
          (acc, next) => (next.rest ? Codecs.SingleSig.dec(next.rest) : acc),
          undefined as undefined | SingleSig
        );
      }
      // Extract MultiSig parts
      const sigs = new Set<MultiSigPart>();
      parsed.forEach((next) => {
        if (next.rest) {
          const parsedSigs = Codecs.MultiSig.dec(next.rest);
          parsedSigs.forEach((nextSig) => {
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
      if (currerntAccount.templateAddress === StdPublicKeys.SingleSig) {
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
    // eslint-disable-next-line no-console
    console.error('Cannot import transaction:', err);
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
    const tplAddr = isAthenaWalletAccount(acc)
      ? athenaSuffix(acc.templateAddress)
      : acc.templateAddress;
    switch (tplAddr) {
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
      case athenaSuffix(Athena.Wallet.TEMPLATE_PUBKEY_HEX):
      case StdPublicKeys.SingleSig: {
        if (!isSingleSigAccount(acc) && !isAthenaWalletAccount(acc)) {
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
    <Modal isOpen={isOpen} onClose={close} isCentered size="xl">
      <Form control={control}>
        <input
          type="hidden"
          {...register('templateAddress', {
            value: O.mapWithDefault(
              currerntAccount,
              StdPublicKeys.SingleSig,
              (acc) =>
                (acc.isAthena
                  ? athenaSuffix(acc.templateAddress)
                  : acc.templateAddress) as StdTemplateKeys
            ),
          })}
        />
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader pt={0} textAlign="center" fontSize="x-large">
            Send a transaction
            <Text fontSize="xs">
              Or you can
              <TxFileReader
                multiple
                isDisabled={
                  !!(currerntAccount && isVaultAccount(currerntAccount)) ||
                  !!currerntAccount?.isAthena
                }
                onRead={handleImportTx}
                onError={showImportError}
              >
                <Button
                  variant="link"
                  as="u"
                  color="brand.lightGray"
                  size="xs"
                  cursor="pointer"
                  p={1}
                  isDisabled={
                    !!(currerntAccount && isVaultAccount(currerntAccount)) ||
                    !!currerntAccount?.isAthena
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
          <ModalBody>
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
                <Card shadow={0}>
                  <CardBody
                    pt={2}
                    pr={0}
                    pb={1}
                    pl={0}
                    bg="brand.modalGreen"
                    color="brand.lightGray"
                  >
                    {renderTemplateSpecificFields(curAcc)}
                  </CardBody>
                </Card>
              )
            )}
            <Flex mt={0}>
              <Box mr={2} w="50%">
                <FormInput
                  label="Gas Price"
                  inputProps={{
                    type: 'number',
                  }}
                  register={register('gasPrice', {
                    value: 1,
                    valueAsNumber: true,
                  })}
                  errors={errors}
                  isSubmitted={isSubmitted}
                  inputAddon={
                    <InputRightElement w="auto" pr={2}>
                      <Text fontSize="x-small" mr={2}>
                        Smidge per unit
                      </Text>
                    </InputRightElement>
                  }
                  hint={
                    <>
                      <Text mb={2}>
                        <strong>How much to pay per gas unit</strong>
                        <br />
                        During high network traffic, transactions with higher
                        gas prices are prioritized.
                      </Text>
                      <Text>
                        Example: transaction costs 25,000 gas units, gas price
                        is 2 smidges, the total fee will be 50,000 smidges.
                      </Text>
                    </>
                  }
                />
              </Box>
              <Box ml={2} w="50%">
                <FormInput
                  label="Nonce"
                  inputProps={{
                    type: 'number',
                  }}
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
                  hint={
                    <Text>
                      <strong>The transaction counter</strong>
                      <br />
                      The number is used only to ensure each transaction is
                      unique.
                      <br />
                      It increments automatically, but can be set manually if
                      needed.
                    </Text>
                  }
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
            {txData && (
              <ConfirmationModal
                {...txData}
                estimatedGas={estimatedGas}
                isOpen={confirmationModal.isOpen}
                onClose={onConfirmationModalClose}
                onSubmit={signAndPublish}
                onExport={exportTx}
                isMultiSig={txData.isMultiSig ?? false}
                required={txData.required}
                isLedgerRejected={isLedgerRejected}
                insufficientFunds={insufficientFunds}
              />
            )}
            {txData && (
              <ExportSuccessModal
                templateAddress={
                  txData?.form.templateAddress as StdTemplateKeys
                }
                isSigned={isExportedSigned}
                isOpen={exportSuccessModal.isOpen}
                onClose={exportSuccessModal.onClose}
              />
            )}
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button
              px={12}
              variant="whiteModal"
              onClick={submit}
              isDisabled={isCurrentVaultAccount}
            >
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
}

export default SendTxModal;
