import { useEffect, useState } from 'react';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useIdle } from '@uidotdev/usehooks';

import useLockWallet from '../hooks/useLockWallet';
import useWindowFocus from '../hooks/useWindowFocus';
import useWallet from '../store/useWallet';
import { noop } from '../utils/func';

const IDLE_TIME_SECONDS = 120;
const IDLE_ALERT_SECONDS = 30;

function IdleAlert(): JSX.Element {
  const { isWalletUnlocked } = useWallet();
  const lockWallet = useLockWallet();
  const isIdle = useIdle(IDLE_TIME_SECONDS * 1000);
  const isFocused = useWindowFocus();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(IDLE_ALERT_SECONDS);
  const [shouldLockWallet, setShouldLockWallet] = useState(false);

  // Handle showing/hiding modal
  useEffect(() => {
    if ((isIdle || !isFocused) && isWalletUnlocked()) {
      setShowModal(true);
      setCountdown(IDLE_ALERT_SECONDS);
      setShouldLockWallet(false);
    } else {
      setShowModal(false);
    }
  }, [isIdle, isFocused, isWalletUnlocked]);

  // Countdown timer
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timer: ReturnType<typeof setInterval>;
    if (showModal) {
      timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount === 1) {
            clearInterval(timer);
            setShouldLockWallet(true);
            setShowModal(false);
            return prevCount;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showModal]);

  // Lock the wallet
  useEffect(() => {
    if (shouldLockWallet) {
      lockWallet();
    }
  }, [shouldLockWallet, lockWallet]);

  return (
    <Modal isOpen={showModal} onClose={noop}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            Wallet will be locked in {countdown} seconds
          </ModalHeader>
          <ModalBody>Please, move the mouse to keep the wallet open.</ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
}

export default IdleAlert;
