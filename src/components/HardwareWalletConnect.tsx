import {
  Box,
  Button,
  ButtonGroup,
  Flex,
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
  useBreakpointValue,
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
  IS_SUPPORTED,
  LedgerDevice,
  LedgerTransports,
} from '../store/useHardwareWallet';
import { noop } from '../utils/func';

// Child Components
function DeviceSelectionModal() {
  const { modalConnect, connectDevice } = useHardwareWallet();
  return (
    <Modal
      isOpen={modalConnect.isOpen}
      onClose={modalConnect.onClose}
      isCentered
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center">Connect to Ledger Device</ModalHeader>
        <ModalBody minH={0} pb={6}>
          <Text mb={8} textAlign="center">
            Please turn on your Ledger device, unlock the PIN code, and pick the
            connection type:
          </Text>

          {!IS_SUPPORTED && (
            <Text color="orange" fontSize="sm" mb={4}>
              Your browser does not support connecting to Ledger devices.
              <br />
              Please, switch to <strong>Chrome</strong>, <strong>Brave</strong>,
              Edge or Opera browser
            </Text>
          )}
          <ButtonGroup w="100%">
            <Button
              onClick={() => connectDevice(LedgerTransports.Bluetooth)}
              flex={1}
              h="60px"
              isDisabled={!IS_SUPPORTED}
              variant="whiteModal"
              display="flex"
              flexDir="column"
            >
              <Flex alignItems="center" justifyContent="center" w="100%">
                <IconBluetooth />
                <Text>Bluetooth</Text>
              </Flex>
              <Text fontSize="xx-small" mt={1}>
                (Ledger Nano X)
              </Text>
            </Button>
            <Button
              onClick={() => connectDevice(LedgerTransports.WebUSB)}
              flex={1}
              h="60px"
              isDisabled={!IS_SUPPORTED}
              variant="whiteModal"
              display="flex"
              flexDir="column"
            >
              <Flex alignItems="center" justifyContent="center" w="100%">
                <IconUsb />
                <Text>WebUSB</Text>
              </Flex>
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
        <ModalCloseButton />
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

function WrongDeviceModal() {
  const { modalWrongDevice, resetDevice } = useHardwareWallet();
  const disconnectAndClose = () => {
    resetDevice();
    modalWrongDevice.onClose();
  };

  return (
    <Modal
      isOpen={modalWrongDevice.isOpen}
      onClose={modalWrongDevice.onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Wrong Ledger device is connected</ModalHeader>
        <ModalBody minH={0} pb={6}>
          <Text>
            Connected Ledger device does not have required public key to sign
            this transaction. Please, connect the proper Ledger device and try
            again.
          </Text>
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
          <Button colorScheme="blue" onClick={modalWrongDevice.onClose}>
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function NotConnected() {
  const { modalConnect } = useHardwareWallet();
  const mobile = useBreakpointValue({ base: true, md: false }) ?? true;
  return (
    <>
      <IconButton
        icon={<IconDeviceUsb size={mobile ? 20 : 24} />}
        size="sm"
        title="Connect a Hardware Wallet"
        aria-label="Connect a Hardware Wallet"
        m={mobile ? 0 : 2}
        p={mobile ? 0 : 2}
        onClick={modalConnect.onOpen}
        variant="dark"
      />
      <DeviceSelectionModal />
    </>
  );
}

function Connected({ device }: { device: LedgerDevice }) {
  const { resetDevice } = useHardwareWallet();
  const mobile = useBreakpointValue({ base: true, md: false }) ?? true;
  const TransportIcon =
    device.transportType === LedgerTransports.Bluetooth
      ? IconBluetoothConnected
      : IconUsb;

  return (
    <>
      <IconButton
        icon={<TransportIcon size={mobile ? 20 : 24} color="green" />}
        size="sm"
        title="Disconnect a Hardware Wallet"
        aria-label="Disconnect a Hardware Wallet"
        m={mobile ? 0 : 2}
        p={mobile ? 0 : 2}
        onClick={resetDevice}
      />
      <DeviceReconnectModal />
      <DeviceApprovalModal />
      <WrongDeviceModal />
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
