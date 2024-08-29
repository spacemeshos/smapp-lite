import { IconButton, useBreakpointValue } from '@chakra-ui/react';
import { IconLock } from '@tabler/icons-react';

import useLockWallet from '../hooks/useLockWallet';

function LockWallet(): JSX.Element {
  const lockWallet = useLockWallet();
  const iconSize = useBreakpointValue({ base: 20, md: 24 }, { ssr: false });

  return (
    <IconButton
      aria-label="Lock wallet"
      icon={<IconLock size={iconSize} />}
      size="sm"
      onClick={lockWallet}
      m={{ base: 0, md: 2 }}
      p={{ base: 0, md: 2 }}
      variant="dark"
    />
  );
}

export default LockWallet;
