import { useState } from 'react';

import { CopyIcon } from '@chakra-ui/icons';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { useCopyToClipboard } from '@uidotdev/usehooks';

type CopyButtonProps = {
  value: string;
};

function CopyButton({ value }: CopyButtonProps): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  let timeout: ReturnType<typeof setTimeout>;

  return (
    <Tooltip label="Copied" isOpen={isCopied}>
      <IconButton
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
        icon={<CopyIcon />}
        ml={1}
      />
    </Tooltip>
  );
}

export default CopyButton;
