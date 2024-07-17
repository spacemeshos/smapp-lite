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
  transport: LedgerTransports;
  app: SpaceMeshApp;
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
  reconnect: () => void;
  resetDevice: () => void;
};

// Hook

const createLedgerTransport = (
  transport: LedgerTransports
): Promise<Transport> => {
  switch (transport) {
    case LedgerTransports.Bluetooth:
      return LedgerWebBLE.create();
    case LedgerTransports.WebUSB:
      return LedgerWebUSB.create();
    default: {
      throw new Error(`Unknown Ledger transport: ${transport}`);
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

  const selectLedgerDevice = async (transport: LedgerTransports) => {
    const app = new SpaceMeshApp(await createLedgerTransport(transport));
    setDevice({
      type: KeyOrigin.Ledger,
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

  const resetDevice = () => {
    setDevice(null);
  };

  const reconnect = async () => {
    if (O.isNone(selectedDevice)) {
      modalConnect.onOpen();
      modalReconnect.onClose();
      return;
    }

    await selectLedgerDevice(selectedDevice.transport);
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
    reconnect: noop,
    resetDevice: noop,
  },
  useHardwareWallet
);
