import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Image,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Spacer,
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

import ledgerLogo from '../assets/ledger_logo.svg';
import useHardwareWallet, {
  LedgerDevice,
  LedgerTransports,
} from '../store/useHardwareWallet';
import { BUTTON_ICON_SIZE } from '../utils/constants';
import { noop } from '../utils/func';

// Child Components
function DeviceSelectionModal() {
  const { modalConnect, connectDevice } = useHardwareWallet();
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
              onClick={() => connectDevice(LedgerTransports.Bluetooth)}
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
              onClick={() => connectDevice(LedgerTransports.WebUSB)}
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
  const { modalReconnect, reconnectDevice, resetDevice, connectionError } =
    useHardwareWallet();

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
          <Text mb={4} color="red">
            Cannot get access to the Hardware Wallet:
            <br />
            {connectionError}
          </Text>
          <Box fontSize="sm">
            <Text mb={2}>Please follow next steps to reconnect:</Text>
            <OrderedList spacing={1}>
              <ListItem>Check the device connection,</ListItem>
              <ListItem>Unlock the device,</ListItem>
              <ListItem>Run Spacemesh App on your Ledger,</ListItem>
              <ListItem>Click the button below.</ListItem>
            </OrderedList>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            colorScheme="red"
            onClick={disconnectAndClose}
          >
            Disconnect
          </Button>
          <Spacer />
          <Button colorScheme="blue" onClick={reconnectDevice}>
            <IconRefresh style={{ margin: 'auto' }} />
            Reconnect
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function DeviceApprovalModal() {
  const { modalApproval } = useHardwareWallet();

  return (
    <Modal isOpen={modalApproval.isOpen} onClose={noop} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign Transaction on Ledger Device</ModalHeader>
        <ModalBody minH={0} pb={6}>
          <Text>
            Please verify the transaction on your Ledger device and select
            either &quot;Approve&quot; or &quot;Reject&quot; option.
            <Image src={ledgerLogo} width={100} mt={6} />
          </Text>
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
    device.transportType === LedgerTransports.Bluetooth
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
      <DeviceApprovalModal />
    </>
  );
}

// Main Component

function HardwareWalletConnect() {
  const { connectedDevice } = useHardwareWallet();
  return O.mapWithDefault(connectedDevice, <NotConnected />, (device) => (
    <Connected device={device} />
  ));
}

export default HardwareWalletConnect;
