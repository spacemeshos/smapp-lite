import { useRef } from 'react';
import { Form } from 'react-hook-form';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react';

import usePassword from '../store/usePassword';

import PasswordInput from './PasswordInput';

function PasswordAlert(): JSX.Element {
  const { form } = usePassword();
  const cancelRef = useRef<HTMLButtonElement>(null);
  if (!form.register.password || !form.register.remember) {
    throw new Error('PasswordAlert: password or remember is not registered');
  }

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={form.isOpen}
      onClose={form.onClose}
      isCentered
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <Form control={form.control}>
          <AlertDialogCloseButton />
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Password required
          </AlertDialogHeader>

          <AlertDialogBody>
            {form.errors.root?.message && (
              <Text color="red" mb={4}>
                {form.errors.root?.message}
              </Text>
            )}
            {form.additionalInfo ? (
              form.additionalInfo
            ) : (
              <Text>Please enter password to proceed</Text>
            )}
            <FormControl
              isInvalid={!!form.errors.password?.message}
              mt={2}
              mb={2}
            >
              <PasswordInput register={form.register.password} />
              <FormErrorMessage>
                {form.errors.password?.message}
              </FormErrorMessage>
            </FormControl>
            <Checkbox {...form.register.remember}>
              Remember password for next 5 minutes
            </Checkbox>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={form.onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="purple"
              onClick={form.onSubmit}
              ml={3}
            >
              {form.actionLabel}
            </Button>
          </AlertDialogFooter>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PasswordAlert;
