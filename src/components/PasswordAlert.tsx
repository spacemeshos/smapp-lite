import { useRef, useState } from 'react';
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

function PasswordAlert(): JSX.Element | null {
  const [isLoading, setIsLoading] = useState(false);
  const { form } = usePassword();
  const cancelRef = useRef<HTMLButtonElement>(null);
  if (!form.register.password || !form.register.remember) {
    return null;
  }

  const onSubmit = async () => {
    setIsLoading(true);
    await form.onSubmit();
    setIsLoading(false);
  };

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={form.isOpen}
      onClose={form.onClose}
      isCentered
      size="lg"
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <Form control={form.control}>
          <AlertDialogCloseButton />
          <AlertDialogHeader fontSize="lg" fontWeight="bold" textAlign="center">
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
              <PasswordInput
                register={form.register.password}
                inputProps={{
                  variant: 'whitePill',
                }}
              />
              <FormErrorMessage textColor="brand.red">
                {form.errors.password?.message}
              </FormErrorMessage>
            </FormControl>
            <Checkbox {...form.register.remember} borderColor="brand.darkGreen">
              Remember password for next 5 minutes
            </Checkbox>
          </AlertDialogBody>

          <AlertDialogFooter justifyContent="space-between">
            <Button ref={cancelRef} onClick={form.onClose} variant="whiteModal">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="whiteModal"
              onClick={onSubmit}
              ml={3}
              disabled={isLoading}
            >
              {isLoading ? 'Checking password...' : form.actionLabel}
            </Button>
          </AlertDialogFooter>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PasswordAlert;
