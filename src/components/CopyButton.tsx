import { IconButton, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { IconCopy } from '@tabler/icons-react';

import useCopy from '../hooks/useCopy';

type CopyButtonProps = {
  value: string;
  withOutline?: boolean;
};

function CopyButton({
  value,
  withOutline = false,
}: CopyButtonProps): JSX.Element {
  const { isCopied, onCopy } = useCopy();
  const iconSize = useBreakpointValue({ base: 14, md: 18 }, { ssr: false });

  return (
    <Tooltip label="Copied" isOpen={isCopied}>
      <IconButton
        variant={withOutline ? 'whiteOutline' : 'ghostWhite'}
        aria-label="Copy to clipboard"
        size="xs"
        onClick={() => onCopy(value)}
        disabled={isCopied}
        icon={<IconCopy size={withOutline ? 12 : iconSize} />}
        ml={1}
        border={withOutline ? '1px' : '0px'}
      />
    </Tooltip>
  );
}

export default CopyButton;
