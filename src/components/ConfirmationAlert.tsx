import { useRef } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

import useConfirmation from '../hooks/useConfirmation';

function ConfirmationAlert(): JSX.Element {
  const { disclosure } = useConfirmation();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={disclosure.isOpen}
      onClose={disclosure.onClose}
      isCentered
      size="lg"
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogCloseButton />
        <AlertDialogHeader fontSize="lg" fontWeight="bold" textAlign="center">
          {disclosure.header}
        </AlertDialogHeader>

        <AlertDialogBody>{disclosure.content}</AlertDialogBody>

        <AlertDialogFooter justifyContent="space-between">
          <Button
            ref={cancelRef}
            onClick={disclosure.onClose}
            variant="whiteModal"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={disclosure.isDanger ? 'danger' : 'whiteModal'}
            onClick={disclosure.onSubmit}
            ml={3}
          >
            {disclosure.actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmationAlert;
