import {
  Button,
  ButtonGroup,
  IconButton,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Text,
} from '@chakra-ui/react';
import { O } from '@mobily/ts-belt';
import {
  IconBluetooth,
  IconBluetoothConnected,
  IconDeviceUsb,
  IconRefresh,
  IconUsb,
} from '@tabler/icons-react';

import useHardwareWallet, {
  LedgerDevice,
  LedgerTransports,
} from '../store/useHardwareWallet';
import { BUTTON_ICON_SIZE } from '../utils/constants';

// Child Components
function DeviceSelectionModal() {
  const { modalConnect, selectLedgerDevice } = useHardwareWallet();
  return (
    <Modal
      isOpen={modalConnect.isOpen}
      onClose={modalConnect.onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Connect to Ledger Device</ModalHeader>
        <ModalBody minH={0} pb={6}>
          <Text mb={4}>
            Please turn on your Ledger device, unlock the PIN code, and pick the
            connection type:
          </Text>
          <ButtonGroup w="100%">
            <Button
              colorScheme="blue"
              onClick={() => selectLedgerDevice(LedgerTransports.Bluetooth)}
              display="block"
              flex={1}
              h={20}
            >
              <IconBluetooth style={{ margin: 'auto' }} />
              Bluetooth
              <Text fontSize="xx-small" mt={1}>
                (Ledger Nano X)
              </Text>
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => selectLedgerDevice(LedgerTransports.WebUSB)}
              display="block"
              flex={1}
              h={20}
            >
              <IconUsb style={{ margin: 'auto' }} />
              WebUSB
              <Text fontSize="xx-small" mt={1}>
                (Ledger Nano S or S Plus)
              </Text>
            </Button>
          </ButtonGroup>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function DeviceReconnectModal() {
  const { modalReconnect, reconnect, resetDevice } = useHardwareWallet();
  const disconnectAndClose = () => {
    resetDevice();
    modalReconnect.onClose();
  };

  return (
    <Modal
      isOpen={modalReconnect.isOpen}
      onClose={disconnectAndClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Reconnect to Ledger Device</ModalHeader>
        <ModalBody minH={0} pb={6}>
          <Text mb={4}>
            Cannot get access to the Hardware Wallet.
            <br />
            Please follow next steps to reconnect:
          </Text>
          <OrderedList spacing={1}>
            <ListItem>Check the device connection,</ListItem>
            <ListItem>Unlock the device,</ListItem>
            <ListItem>Run Spacemesh App on your Ledger,</ListItem>
            <ListItem>Click the button below.</ListItem>
          </OrderedList>
          <Button
            colorScheme="blue"
            onClick={reconnect}
            display="block"
            flex={1}
            h={20}
            mb={4}
          >
            <IconRefresh style={{ margin: 'auto' }} />
            Reconnect
          </Button>
          <Button variant="outline" onClick={disconnectAndClose} m="auto">
            Disconnect
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function NotConnected() {
  const { modalConnect } = useHardwareWallet();
  return (
    <>
      <IconButton
        icon={<IconDeviceUsb size={BUTTON_ICON_SIZE} />}
        title="Connect a Hardware Wallet"
        aria-label="Connect a Hardware Wallet"
        ml={2}
        onClick={modalConnect.onOpen}
      />
      <DeviceSelectionModal />
    </>
  );
}

function Connected({ device }: { device: LedgerDevice }) {
  const { resetDevice } = useHardwareWallet();

  const TransportIcon =
    device.transport === LedgerTransports.Bluetooth
      ? IconBluetoothConnected
      : IconUsb;

  return (
    <>
      <IconButton
        icon={<TransportIcon size={BUTTON_ICON_SIZE} color="green" />}
        title="Disconnect a Hardware Wallet"
        aria-label="Disconnect a Hardware Wallet"
        ml={2}
        onClick={resetDevice}
      />
      <DeviceReconnectModal />
    </>
  );
}

// Main Component

function HardwareWalletConnect() {
  const { selectedDevice } = useHardwareWallet();
  return O.mapWithDefault(selectedDevice, <NotConnected />, (device) => (
    <Connected device={device} />
  ));
}

export default HardwareWalletConnect;
