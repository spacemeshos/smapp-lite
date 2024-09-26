import { useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { useDisclosure } from '@chakra-ui/react';

import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import { noop } from '../utils/func';

const useMnemonics = () => {
  const mnemonicsModal = useDisclosure();
  const [mnemonics, setMnemonics] = useState('');
  const { showMnemonics } = useWallet();
  const { withPassword } = usePassword();

  const revealMnemonics = async () => {
    const words = await withPassword(
      showMnemonics,
      'Show Mnemonics',
      // eslint-disable-next-line max-len
      'Please enter your password to read mnemonics from the secret part of your wallet:'
    );
    if (words) {
      setMnemonics(words);
      mnemonicsModal.onOpen();
    }
  };

  const closeMnemonicsModal = () => {
    setMnemonics('');
    setTimeout(() => {
      // Postpone it for the next tick to clean up mnemonics
      // from React component before unmount
      mnemonicsModal.onClose();
    }, 0);
  };

  return {
    mnemonics,
    revealMnemonics,
    closeMnemonicsModal,
    isOpen: mnemonicsModal.isOpen,
  };
};

export default singletonHook(
  {
    mnemonics: '',
    revealMnemonics: Promise.resolve,
    closeMnemonicsModal: noop,
    isOpen: false,
  },
  useMnemonics
);
