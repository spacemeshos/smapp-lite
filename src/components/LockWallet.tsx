import { IconButton } from '@chakra-ui/react';
import { IconLock } from '@tabler/icons-react';

import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';

function LockWallet(): JSX.Element {
  const { lockWallet } = useWallet();
  const { resetPassword } = usePassword();

  return (
    <IconButton
      aria-label="Lock wallet"
      icon={<IconLock />}
      onClick={() => {
        lockWallet();
        resetPassword();
      }}
      ml={2}
    />
  );
}

export default LockWallet;
