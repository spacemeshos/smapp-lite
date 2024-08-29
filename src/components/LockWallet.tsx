import { IconButton, useBreakpointValue } from '@chakra-ui/react';
import { IconLock } from '@tabler/icons-react';

import useLockWallet from '../hooks/useLockWallet';
import { MAIN_MENU_BUTTONS_SIZE } from '../utils/constants';

function LockWallet(): JSX.Element {
  const lockWallet = useLockWallet();
  const iconSize = useBreakpointValue(MAIN_MENU_BUTTONS_SIZE, { ssr: false });

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
