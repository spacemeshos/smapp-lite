import { useState } from 'react';

import { IconButton, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { IconCopy } from '@tabler/icons-react';
import { useCopyToClipboard } from '@uidotdev/usehooks';

type CopyButtonProps = {
  value: string;
  withOutline?: boolean;
};

function CopyButton({
  value,
  withOutline = false,
}: CopyButtonProps): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();
  const iconSize = useBreakpointValue({ base: 14, md: 18 }, { ssr: false });

  let timeout: ReturnType<typeof setTimeout>;

  return (
    <Tooltip label="Copied" isOpen={isCopied}>
      <IconButton
        variant={withOutline ? 'whiteOutline' : 'ghostWhite'}
        aria-label="Copy to clipboard"
        size="xs"
        onClick={() => {
          clearTimeout(timeout);
          copy(value);
          setIsCopied(true);
          timeout = setTimeout(() => {
            setIsCopied(false);
          }, 5000);
        }}
        disabled={isCopied}
        icon={<IconCopy size={withOutline ? 12 : iconSize} />}
        ml={1}
        border={withOutline ? '1px' : '0px'}
      />
    </Tooltip>
  );
}

export default CopyButton;
