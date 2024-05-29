import { Button, ButtonProps, IconButton } from '@chakra-ui/react';
import { O } from '@mobily/ts-belt';
import { IconWorldSearch } from '@tabler/icons-react';

import useNetworks from '../store/useNetworks';
import { DEFAULT_EXPLORER_URL } from '../utils/constants';
import getExplorerUrl, { ExplorerDataType } from '../utils/getExplorerUrl';

interface ExplorerButtonProps extends ButtonProps {
  dataType: ExplorerDataType;
  value: string;
  full?: boolean;
  iconSize?: number;
  label?: string;
  v2?: boolean;
}

function ExplorerButton({
  dataType,
  value,
  iconSize,
  label,
  full,
  v2,
  ...buttonProps
}: ExplorerButtonProps): JSX.Element {
  const { getCurrentNetwork } = useNetworks();
  const explorerUrl = O.mapWithDefault(
    getCurrentNetwork(),
    DEFAULT_EXPLORER_URL,
    (net) => net.explorerUrl
  );

  if (full) {
    return (
      <Button
        as="a"
        href={getExplorerUrl(explorerUrl, dataType, value, v2)}
        target="_blank"
        leftIcon={<IconWorldSearch />}
        w="100%"
        {...buttonProps}
      >
        {label}
      </Button>
    );
  }

  return (
    <IconButton
      as="a"
      aria-label="Open in explorer"
      size="xs"
      href={getExplorerUrl(explorerUrl, dataType, value, v2)}
      target="_blank"
      icon={<IconWorldSearch size={iconSize} />}
      {...buttonProps}
    />
  );
}

ExplorerButton.defaultProps = {
  v2: false,
  full: false,
  iconSize: 14,
  label: 'Open in Explorer',
};

export default ExplorerButton;
