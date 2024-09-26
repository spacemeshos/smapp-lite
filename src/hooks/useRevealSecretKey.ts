import { useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { useDisclosure } from '@chakra-ui/react';

import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import { HexString } from '../types/common';
import { SafeKey } from '../types/wallet';
import { noop } from '../utils/func';

type RevealedKey = {
  displayName: string;
  secretKey: HexString;
};

const useRevealSecretKey = () => {
  const secretKeyModal = useDisclosure();
  const [secretKey, setSecretKey] = useState<RevealedKey | null>(null);
  const { revealSecretKey: readSecretKey } = useWallet();
  const { withPassword } = usePassword();

  const revealSecretKey = async (key: SafeKey) => {
    const sk = await withPassword(
      (password) => readSecretKey(key.publicKey, password),
      'Reveal Secret Key',
      // eslint-disable-next-line max-len
      `Please type the password to reveal secret key for account "${key.displayName}"`
    );
    if (sk) {
      setSecretKey({
        displayName: key.displayName,
        secretKey: sk,
      });
      secretKeyModal.onOpen();
    }
  };

  const closeSecretKeyModal = () => {
    setSecretKey(null);
    setTimeout(() => {
      // Postpone it for the next tick to clean up mnemonics
      // from React component before unmount
      secretKeyModal.onClose();
    }, 0);
  };

  return {
    secretKey,
    revealSecretKey,
    closeSecretKeyModal,
    isOpen: secretKeyModal.isOpen,
  };
};

export default singletonHook(
  {
    secretKey: null,
    revealSecretKey: Promise.resolve,
    closeSecretKeyModal: noop,
    isOpen: false,
  },
  useRevealSecretKey
);
