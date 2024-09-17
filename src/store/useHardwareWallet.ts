import { detect } from 'detect-browser';
import { useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { useDisclosure, UseDisclosureReturn } from '@chakra-ui/react';
import Transport from '@ledgerhq/hw-transport';
import LedgerWebBLE from '@ledgerhq/hw-transport-web-ble';
import LedgerWebUSB from '@ledgerhq/hw-transport-webusb';
import { O } from '@mobily/ts-belt';
import { LedgerError, ResponseError } from '@zondax/ledger-js';
import {
  Account,
  AccountType,
  ResponseAddress,
  SpaceMeshApp,
} from '@zondax/ledger-spacemesh';

import { HexString } from '../types/common';
import { AccountWithAddress, KeyOrigin } from '../types/wallet';
import {
  isMultiSigAccount,
  isSingleSigAccount,
  isVestingAccount,
} from '../utils/account';
import Bip32KeyDerivation from '../utils/bip32';
import { getDisclosureDefaults } from '../utils/disclosure';
import { noop } from '../utils/func';
import { toHexString } from '../utils/hexString';

export const IS_SUPPORTED = (() => {
  // User Agent cannot change during the runtime
  const browser = detect();
  switch (browser && browser.name) {
    case 'chrome':
    case 'chromium-webview':
    case 'edge':
    case 'edge-chromium':
    case 'edge-ios':
    case 'opera':
    case 'opera-mini':
    case 'samsung':
    case 'yandexbrowser':
      return true;
    default:
      return false;
  }
})();

// Types

export enum LedgerTransports {
  Bluetooth = 'Bluetooth',
  WebUSB = 'WebUSB',
}

export enum VerificationStatus {
  Pending = 'Pending',
  ApprovedCorrect = 'ApprovedCorrect',
  ApprovedWrong = 'ApprovedWrong',
  Rejected = 'Rejected',
  NotConnected = 'NotConnected',
}

export type LedgerDevice = {
  type: KeyOrigin.Ledger;
  transportType: LedgerTransports;
  app: SpaceMeshApp;
  transport: Transport;
  actions: {
    getPubKey: (path: string) => Promise<HexString>;
    signTx: (path: string, blob: Uint8Array) => Promise<Uint8Array>;
    verify: (
      path: string,
      account: AccountWithAddress,
      index?: number
    ) => Promise<VerificationStatus>;
  };
};

export type UseHardwareWalletHook = {
  // Data
  connectedDevice: O.Option<LedgerDevice>; // None if not selected
  isDeviceConnected: boolean;
  connectionError: string | null;
  // Utils
  // eslint-disable-next-line max-len
  modalConnect: UseDisclosureReturn;
  modalReconnect: UseDisclosureReturn;
  modalApproval: UseDisclosureReturn;
  modalWrongDevice: UseDisclosureReturn;
  // Actions
  connectDevice: (transport: LedgerTransports) => void;
  reconnectDevice: () => Promise<void>;
  resetDevice: () => Promise<void>;
  checkDeviceConnection: () => Promise<boolean>;
};

// Hook

const createLedgerTransport = (
  transportType: LedgerTransports
): Promise<Transport> => {
  switch (transportType) {
    case LedgerTransports.Bluetooth:
      return LedgerWebBLE.create();
    case LedgerTransports.WebUSB:
      return LedgerWebUSB.create();
    default: {
      throw new Error(`Unknown Ledger transport: ${transportType}`);
    }
  }
};

const verifyAddress =
  (account: AccountWithAddress) => (response: ResponseAddress) =>
    response.address === account.address
      ? VerificationStatus.ApprovedCorrect
      : VerificationStatus.ApprovedWrong;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleVerificationError = (err: any) => {
  if (err.returnCode === LedgerError.TransactionRejected) {
    return VerificationStatus.Rejected;
  }
  throw err;
};

const useHardwareWallet = (): UseHardwareWalletHook => {
  const [device, setDevice] = useState<LedgerDevice | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const modalConnect = useDisclosure({ id: 'connectDevice' });
  const modalReconnect = useDisclosure({ id: 'reconnectDevice' });
  const modalApproval = useDisclosure({ id: 'approvalDevice' });
  const modalWrongDevice = useDisclosure({ id: 'wrongDevice' });

  const handleLedgerError = (e: Error) => {
    modalReconnect.onOpen();
    throw e;
  };

  const connectDevice = async (transportType: LedgerTransports) => {
    const transport = await createLedgerTransport(transportType);
    const app = new SpaceMeshApp(transport);
    setDevice({
      type: KeyOrigin.Ledger,
      transportType,
      transport,
      app,
      actions: {
        getPubKey: async (path) =>
          app
            .getAddressAndPubKey(path, false)
            .then((x) => toHexString(x.pubkey))
            .catch(handleLedgerError),
        signTx: async (path, blob) => {
          modalApproval.onOpen();
          const res = await app
            .sign(path, Buffer.from(blob))
            .then((x) => Uint8Array.from(x.signature))
            .catch((e) => {
              modalApproval.onClose();
              if (e instanceof ResponseError) {
                if (e.returnCode === 27014 || e.returnCode === 65535) {
                  throw e;
                }
              }
              return handleLedgerError(e);
            });
          modalApproval.onClose();
          return res;
        },
        verify: async (path, account, index = 0) => {
          const result = (() => {
            if (isSingleSigAccount(account)) {
              return app.getAddressAndPubKey(path, true);
            }
            if (isMultiSigAccount(account) || isVestingAccount(account)) {
              return app.getAddressMultisig(
                path,
                index,
                new Account(
                  AccountType.Multisig,
                  account.spawnArguments.Required,
                  account.spawnArguments.PublicKeys.length,
                  account.spawnArguments.PublicKeys.map((pk, idx) => ({
                    index: idx,
                    pubkey: Buffer.from(pk, 'hex'),
                  }))
                )
              );
            }
            throw new Error('Unsupported account type');
          })();

          return result
            .then(verifyAddress(account))
            .catch(handleVerificationError)
            .catch(handleLedgerError);
        },
      },
    });
    modalConnect.onClose();

    try {
      await app.getAddressAndPubKey(Bip32KeyDerivation.createPath(0), false);
      setConnectionError(null);
    } catch (e) {
      if (e instanceof Error) {
        setConnectionError(e.message);
      }
      modalReconnect.onOpen();
    }
  };

  const resetDevice = async () => {
    setDevice(null);
    setConnectionError(null);
    try {
      if (device?.transport) {
        await device.transport.close();
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Cannot close Transport', err);
    }
  };

  const reconnectDevice = async () => {
    if (!device) {
      setConnectionError(null);
      modalConnect.onOpen();
      modalReconnect.onClose();
      return;
    }

    modalReconnect.onClose();
    await connectDevice(device.transportType);
  };

  const checkDeviceConnection = async () => {
    if (!device) {
      modalConnect.onOpen();
      return false;
    }
    try {
      await device.actions.getPubKey(Bip32KeyDerivation.createPath(0));
      return true;
    } catch (err) {
      if (err instanceof Error) {
        setConnectionError(err.message);
        modalReconnect.onOpen();
      }
      return false;
    }
  };

  return {
    // Data
    connectedDevice: O.fromNullable(device),
    isDeviceConnected: !!device,
    connectionError,
    // Utils
    modalConnect,
    modalReconnect,
    modalApproval,
    modalWrongDevice,
    // Actions
    connectDevice,
    reconnectDevice,
    resetDevice,
    checkDeviceConnection,
  };
};

export default singletonHook(
  {
    // Data
    connectedDevice: O.None,
    isDeviceConnected: false,
    connectionError: null,
    // Utils
    modalConnect: getDisclosureDefaults(),
    modalReconnect: getDisclosureDefaults(),
    modalApproval: getDisclosureDefaults(),
    modalWrongDevice: getDisclosureDefaults(),
    // Actions
    connectDevice: noop,
    reconnectDevice: Promise.resolve,
    resetDevice: Promise.resolve,
    checkDeviceConnection: () => Promise.resolve(false),
  },
  useHardwareWallet
);
