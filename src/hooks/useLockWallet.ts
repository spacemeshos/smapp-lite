import { useCallback } from 'react';

import useHardwareWallet from '../store/useHardwareWallet';
import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';

const useLockWallet = () => {
  const { lockWallet } = useWallet();
  const { resetPassword } = usePassword();
  const { resetDevice } = useHardwareWallet();

  return useCallback(() => {
    lockWallet();
    resetPassword();
    resetDevice();
  }, [lockWallet, resetDevice, resetPassword]);
};

export default useLockWallet;
