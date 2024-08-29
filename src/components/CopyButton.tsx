import { useState } from 'react';

import { IconButton, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { IconCopy } from '@tabler/icons-react';

type CopyButtonProps = {
  value: string;
};

function CopyButton({ value }: CopyButtonProps): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();
  const iconSize = useBreakpointValue({ base: 14, md: 18 }, { ssr: false });

  let timeout: ReturnType<typeof setTimeout>;

  return (
    <Tooltip label="Copied" isOpen={isCopied}>
      <IconButton
        variant="ghostWhite"
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
        icon={<IconCopy size={iconSize} />}
        ml={1}
      />
    </Tooltip>
  );
}

export default CopyButton;
