import { useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { useDisclosure, UseDisclosureReturn } from '@chakra-ui/react';
import Transport from '@ledgerhq/hw-transport';
import LedgerWebBLE from '@ledgerhq/hw-transport-web-ble';
import LedgerWebUSB from '@ledgerhq/hw-transport-webusb';
import { O } from '@mobily/ts-belt';
import { SpaceMeshApp } from '@zondax/ledger-spacemesh';

import { HexString } from '../types/common';
import { KeyOrigin } from '../types/wallet';
import Bip32KeyDerivation from '../utils/bip32';
import { getDisclosureDefaults } from '../utils/disclosure';
import { noop } from '../utils/func';
import { toHexString } from '../utils/hexString';

// Types

export enum LedgerTransports {
  Bluetooth = 'Bluetooth',
  WebUSB = 'WebUSB',
}

export type LedgerDevice = {
  type: KeyOrigin.Ledger;
  transportType: LedgerTransports;
  app: SpaceMeshApp;
  transport: Transport;
  actions: {
    getPubKey: (path: string) => Promise<HexString>;
    signTx: (path: string, blob: Uint8Array) => Promise<Uint8Array>;
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

const useHardwareWallet = (): UseHardwareWalletHook => {
  const [device, setDevice] = useState<LedgerDevice | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const modalConnect = useDisclosure({ id: 'connectDevice' });
  const modalReconnect = useDisclosure({ id: 'reconnectDevice' });

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
        signTx: async (path, blob) =>
          app
            .sign(path, Buffer.from(blob))
            .then((x) => Uint8Array.from(x.signature))
            .catch(handleLedgerError),
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
    if (device?.transport) {
      await device.transport.close();
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
    // Actions
    connectDevice: noop,
    reconnectDevice: Promise.resolve,
    resetDevice: Promise.resolve,
    checkDeviceConnection: () => Promise.resolve(false),
  },
  useHardwareWallet
);
