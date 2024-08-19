import { IconButton, useBreakpointValue } from '@chakra-ui/react';
import { IconLock } from '@tabler/icons-react';

import useLockWallet from '../hooks/useLockWallet';

function LockWallet(): JSX.Element {
  const lockWallet = useLockWallet();
  const mobile = useBreakpointValue({ base: true, md: false }) ?? true;

  return (
    <IconButton
      aria-label="Lock wallet"
      icon={<IconLock size={mobile ? 20 : 24} />}
      size="sm"
      onClick={lockWallet}
      m={mobile ? 0 : 2}
      p={mobile ? 0 : 2}
      variant="dark"
    />
  );
}

export default LockWallet;
