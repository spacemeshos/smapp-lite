import React, { useEffect, useState } from 'react';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useIdle } from '@uidotdev/usehooks';

import useWallet from '../store/useWallet';

const IDLE_TIME_SECONDS = 120;
const IDLE_ALERT_SECONDS = 30;

function IdleAlert(): JSX.Element {
  const { lockWallet, isWalletUnlocked } = useWallet();
  const isIdle = useIdle(IDLE_TIME_SECONDS * 1000);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(IDLE_ALERT_SECONDS);
  const [shouldLockWallet, setShouldLockWallet] = useState(false);

  // Handle showing/hiding modal
  useEffect(() => {
    if (isIdle && isWalletUnlocked()) {
      setShowModal(true);
      setCountdown(IDLE_ALERT_SECONDS);
      setShouldLockWallet(false);
    } else {
      setShowModal(false);
    }
  }, [isIdle, isWalletUnlocked]);

  // Countdown timer
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timer: any;
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
    <Modal isOpen={showModal} onClose={() => {}}>
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
