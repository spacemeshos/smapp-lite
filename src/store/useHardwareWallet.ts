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
  selectedDevice: O.Option<LedgerDevice>; // None if not selected
  isSelected: boolean;
  // Utils
  modalConnect: UseDisclosureReturn; // null only possible on init
  modalReconnect: UseDisclosureReturn; // null only possible on init
  // Actions
  selectLedgerDevice: (transport: LedgerTransports) => void;
  reconnect: () => Promise<void>;
  resetDevice: () => Promise<void>;
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
  const modalConnect = useDisclosure({ id: 'connectDevice' });
  const modalReconnect = useDisclosure({ id: 'reconnectDevice' });

  const handleLedgerError = (e: Error) => {
    modalReconnect.onOpen();
    throw e;
  };

  const selectLedgerDevice = async (transportType: LedgerTransports) => {
    const transport = await createLedgerTransport(transportType);
    const app = new SpaceMeshApp(transport);
    setDevice({
      type: KeyOrigin.Ledger,
      transportType,
      transport,
      app,
      actions: {
        getPubKey: async (path: string): Promise<HexString> =>
          app
            .getAddressAndPubKey(path, false)
            .then((x) => toHexString(x.pubkey))
            .catch(handleLedgerError),
        signTx: async (path: string, blob: Uint8Array) =>
          app
            .sign(path, Buffer.from(blob))
            .then((x) => Uint8Array.from(x.signature))
            .catch(handleLedgerError),
      },
    });
    modalConnect.onClose();
  };

  const resetDevice = async () => {
    setDevice(null);
    if (device?.transport) {
      await device.transport.close();
    }
  };

  const reconnect = async () => {
    if (O.isNone(selectedDevice)) {
      modalConnect.onOpen();
      modalReconnect.onClose();
      return;
    }

    await selectLedgerDevice(selectedDevice.transportType);
    modalReconnect.onClose();
  };

  const selectedDevice = O.fromNullable(device);

  return {
    // Data
    selectedDevice,
    isSelected: O.isSome(selectedDevice),
    // Utils
    modalConnect,
    modalReconnect,
    // Actions
    selectLedgerDevice,
    reconnect,
    resetDevice,
  };
};

export default singletonHook(
  {
    // Data
    selectedDevice: O.None,
    isSelected: false,
    // Utils
    modalConnect: getDisclosureDefaults(),
    modalReconnect: getDisclosureDefaults(),
    // Actions
    selectLedgerDevice: noop,
    reconnect: Promise.resolve,
    resetDevice: Promise.resolve,
  },
  useHardwareWallet
);
