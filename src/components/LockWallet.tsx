import { IconButton } from '@chakra-ui/react';
import { IconLock } from '@tabler/icons-react';

import useWallet from '../store/useWallet';

function LockWallet(): JSX.Element {
  const { lockWallet } = useWallet();
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
