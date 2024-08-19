import { IconButton, useBreakpointValue } from '@chakra-ui/react';
import { IconLock } from '@tabler/icons-react';

import useLockWallet from '../hooks/useLockWallet';

function LockWallet(): JSX.Element {
  const lockWallet = useLockWallet();
  const mobile = useBreakpointValue({ base: true, md: false }) ?? true;

  return (
    <IconButton
      aria-label="Lock wallet"
      icon={<IconLock size={mobile ? 14 : 24} />}
      onClick={lockWallet}
      mx={mobile ? 0 : 2}
      px={mobile ? 0 : 2}
      variant="dark"
    />
  );
}

export default LockWallet;
