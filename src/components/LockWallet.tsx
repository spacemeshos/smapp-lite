import { IconButton } from '@chakra-ui/react';
import { IconLock } from '@tabler/icons-react';

import useLockWallet from '../hooks/useLockWallet';

function LockWallet(): JSX.Element {
  const lockWallet = useLockWallet();

  return (
    <IconButton
      aria-label="Lock wallet"
      icon={<IconLock />}
      onClick={lockWallet}
      ml={2}
    />
  );
}

export default LockWallet;
