import { useRef } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

import useWallet from '../store/useWallet';

type WipeOutAlertProps = {
  disclosure: ReturnType<typeof useDisclosure>;
};

function WipeOutAlert({ disclosure }: WipeOutAlertProps): JSX.Element {
  const { wipeWallet } = useWallet();
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      isOpen={disclosure.isOpen}
      leastDestructiveRef={cancelRef}
      onClose={disclosure.onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Wipe out the wallet?
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can&apos;t undo this action afterwards.
            <br />
            Please ensure that you have made a backup of your wallet file or
            mnemonics.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={disclosure.onClose} variant="dark">
              Cancel
            </Button>
            <Button
              onClick={() => {
                wipeWallet();
                disclosure.onClose();
              }}
              ml={3}
              variant="danger"
            >
              Wipe out
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default WipeOutAlert;
