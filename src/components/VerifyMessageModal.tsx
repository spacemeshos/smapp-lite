import React, { useRef, useState } from 'react';
import { Form, useForm } from 'react-hook-form';

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
} from '@chakra-ui/react';

import { useVerifyMessage } from '../hooks/useSigning';
import { isSignedMessage } from '../types/message';
import { SIGNED_MESSAGE_PREFIX } from '../utils/constants';

type VerifyMessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

enum VerifyStatus {
  None = 0,
  Valid = 1,
  Invalid = 2,
}

function VerifyMessageModal({
  isOpen,
  onClose,
}: VerifyMessageModalProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    setValue,
    register,
    reset,
    setError: setFormError,
    clearErrors,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<{
    signedMessage: string;
  }>();
  const [verifyStatus, setVerifyStatus] = useState(VerifyStatus.None);
  const verifyMessage = useVerifyMessage();

  const close = () => {
    setVerifyStatus(VerifyStatus.None);
    reset();
    onClose();
  };

  const setError = (...args: Parameters<typeof setFormError>) => {
    setVerifyStatus(VerifyStatus.None);
    setFormError(...args);
  };

  const submit = handleSubmit(({ signedMessage }) => {
    const data = (() => {
      try {
        return JSON.parse(signedMessage);
      } catch (err) {
        setError('root', {
          type: 'manual',
          message: `Failed to parse the message:\n${err}`,
        });
        return null;
      }
    })();

    if (!data) return;
    if (!isSignedMessage(data)) {
      setError('root', {
        type: 'manual',
        message: 'Invalid signed message format',
      });
      return;
    }
    verifyMessage(
      data.signature,
      `${SIGNED_MESSAGE_PREFIX}${data.text}`,
      data.publicKey
    )
      .then((result) => {
        setVerifyStatus(result ? VerifyStatus.Valid : VerifyStatus.Invalid);
      })
      .catch((err) => {
        setError('root', {
          type: 'manual',
          message: `Failed to verify the signature:\n${err}`,
        });
      });
  });

  const readFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setValue('signedMessage', '');
    clearErrors('root');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('root', { type: 'manual', message: 'Failed to read file' });
        return;
      }
      try {
        const msg = JSON.parse(reader.result as string);
        if (!isSignedMessage(msg)) {
          setError('root', {
            type: 'manual',
            message: 'Invalid signed message file',
          });
          return;
        }
        setValue('signedMessage', reader.result);
      } catch (err) {
        setError('root', {
          type: 'manual',
          message: `Failed to open signed message file:\n${err}`,
        });
      }
    };
    reader.readAsText(file);
    if (inputRef.current) {
      // Make it possible to load the same file again
      inputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered>
      <ModalOverlay />
      <ModalContent>
        <Form control={control}>
          <ModalCloseButton />
          <ModalHeader textAlign="center">Verify Message</ModalHeader>
          <ModalBody textAlign="center">
            <Text mb={2} textAlign="center">
              Please select the signed message file:
            </Text>
            <Input
              ref={inputRef}
              display="none"
              type="file"
              accept=".json"
              onChange={readFile}
            />
            <Button
              onClick={() => inputRef.current?.click()}
              variant="whiteModal"
              mx="auto"
            >
              Select the file
            </Button>
            <Text my={2}>
              Or put the signed message object in the text area below:
            </Text>
            <Textarea
              {...register('signedMessage', {
                required: 'Signed message is required',
              })}
              rows={10}
              resize="none"
              borderColor="brand.darkGreen"
              translate="no"
              fontSize="xx-small"
            />
            <Box minH={4} mt={2} textAlign="left">
              {errors.root?.message && (
                <Text whiteSpace="pre-wrap" color="brand.red" mb={4}>
                  <WarningIcon mr={2} mb={1} />
                  {errors.root.message}
                </Text>
              )}
              {verifyStatus === VerifyStatus.Valid && (
                <Text whiteSpace="pre-wrap" color="brand.green" mb={4}>
                  <CheckCircleIcon mr={2} mb={1} />
                  The signature is valid!
                </Text>
              )}
              {verifyStatus === VerifyStatus.Invalid && (
                <Text whiteSpace="pre-wrap" color="brand.red" mb={4}>
                  <WarningIcon mr={2} mb={1} />
                  The signature is not valid!
                </Text>
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" onClick={submit} ml={2} variant="whiteModal">
              Verify
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
}

export default VerifyMessageModal;
