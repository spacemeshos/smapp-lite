import fileDownload from 'js-file-download';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  Textarea,
} from '@chakra-ui/react';

import useCopy from '../hooks/useCopy';
import { useSignMessage } from '../hooks/useSigning';
import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import { SignedMessage } from '../types/message';
import { KeyPairType } from '../types/wallet';
import { SIGNED_MESSAGE_PREFIX } from '../utils/constants';
import { toHexString } from '../utils/hexString';

type SignMessageModalProps = {
  keyIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

function SignMessageModal({
  keyIndex,
  isOpen,
  onClose,
}: SignMessageModalProps): JSX.Element | null {
  const { wallet } = useWallet();
  const signMessage = useSignMessage();
  const { withPassword } = usePassword();
  const { register, reset, handleSubmit } = useForm<{ message: string }>();
  const [signResult, setSignResult] = useState('');
  const { isCopied, onCopy } = useCopy();

  const keys = wallet?.keychain ?? [];
  const key = keys[keyIndex];
  if (!key) return null;

  const close = () => {
    setSignResult('');
    reset();
    onClose();
  };

  const download = () =>
    fileDownload(signResult, `signed-message.json`, 'plain/text');

  const submit = handleSubmit(async ({ message }) => {
    const result = await withPassword(
      async (password) => {
        if (key.type === KeyPairType.Hardware) {
          // Sign using Ledger device
          throw new Error('Hardware wallet is not supported yet');
        }
        const text = `${SIGNED_MESSAGE_PREFIX}${message}`;
        // Sign using local key
        return JSON.stringify(
          {
            publicKey: key.publicKey,
            text,
            signature: toHexString(
              await signMessage(text, key.publicKey, password)
            ),
          } satisfies SignedMessage,
          null,
          2
        );
      },
      'Sign message',
      <>
        Please enter your password to sign the message using key &quot;
        {key.displayName}&quot;{' '}
        <Text as="span" wordBreak="break-all">
          ({key.publicKey})
        </Text>
      </>
    );
    if (result) {
      setSignResult(result);
    } else {
      setSignResult('');
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center">Sign message</ModalHeader>
        {signResult ? (
          <>
            <ModalBody>
              <Text mb={4}>
                Here is your message and the signature. You can copy them to the
                clipboard and share with another party.
              </Text>
              <Textarea
                readOnly
                rows={10}
                resize="none"
                borderColor="brand.darkGreen"
                value={signResult}
                translate="no"
                fontSize="xx-small"
              />
            </ModalBody>
            <ModalFooter gap={2}>
              <Button
                isDisabled={isCopied}
                onClick={() => onCopy(signResult)}
                variant="whiteModal"
                w={20}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
              <Button onClick={download} variant="whiteModal">
                Download
              </Button>
              <Spacer />
              <Button onClick={close} variant="whiteModal">
                Close
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalBody>
              <Text mb={4} fontSize="sm">
                You are going to sign some text message using key &quot;
                {key.displayName}&quot;{' '}
                <Text as="span" wordBreak="break-all">
                  ({key.publicKey})
                </Text>
                :
              </Text>
              <Textarea
                {...register('message', {
                  required: 'Message cannot be empty',
                })}
                rows={4}
                resize="none"
                borderColor="brand.darkGreen"
                translate="no"
              />
              <Text fontSize="xs" color="gray" mt={2}>
                The signature will be generated using the private key.
                <br />
                Another party may verify the message using your public key.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button onClick={submit} ml={2} variant="whiteModal">
                Sign message...
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default SignMessageModal;
