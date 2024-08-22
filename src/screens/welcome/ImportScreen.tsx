import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, useNavigate } from 'react-router-dom';

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import {
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from '@chakra-ui/react';

import BackButton from '../../components/BackButton';
import PasswordInput from '../../components/PasswordInput';
import useWallet from '../../store/useWallet';
import { WalletFile } from '../../types/wallet';
import { postpone } from '../../utils/promises';

type FormValues = {
  password: string;
};

function ImportScreen(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [walletFileContent, setWalletFileContent] = useState<WalletFile | null>(
    null
  );
  const {
    formState: { errors },
    setError,
    clearErrors,
    register,
    handleSubmit,
  } = useForm<FormValues>();
  const { openWallet } = useWallet();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const readFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setWalletFileContent(null);
    clearErrors('root');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('root', { type: 'manual', message: 'Failed to read file' });
        return;
      }
      try {
        const wallet = JSON.parse(reader.result as string);
        if (!wallet?.meta?.displayName || !wallet.crypto) {
          setError('root', { type: 'manual', message: 'Invalid wallet file' });
          return;
        }
        setWalletFileContent(wallet);
      } catch (err) {
        setError('root', {
          type: 'manual',
          message: `Failed to open wallet file:\n${err}`,
        });
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!walletFileContent) {
      setError('root', { type: 'manual', message: 'No wallet file loaded' });
      return;
    }
    setIsLoading(true);
    const success = await postpone(
      // We need to postpone it for one tick
      // to allow component to re-render
      () => openWallet(walletFileContent, password),
      1
    );
    if (!success) {
      setError('password', { type: 'value', message: 'Invalid password' });
      return;
    }
    setIsLoading(false);
    navigate('/wallet');
  });

  return (
    <Flex direction="column" alignItems="center" justifyContent="center">
      <BackButton />
      <Text fontSize="xl" mb={4} mt={2}>
        Import wallet file
      </Text>
      <Card variant="outline" w="100%">
        <CardBody textAlign="center">
          <Form>
            <Text mb={4}>
              Please choose the wallet file you want to import.
            </Text>
            <Input
              ref={inputRef}
              display="none"
              type="file"
              accept=".json"
              onChange={readFile}
            />
            <Button
              size="lg"
              onClick={() => inputRef.current?.click()}
              variant="solid"
              colorScheme="green"
              mb={4}
            >
              Select wallet file
            </Button>
            {walletFileContent && walletFileContent.meta?.displayName && (
              <Text mb={4} color="green.400">
                <CheckCircleIcon mr={2} mb={1} />
                Wallet &quot;{walletFileContent.meta.displayName}&quot; loaded.
              </Text>
            )}
            {errors.root?.message && (
              <Text whiteSpace="pre-wrap" color="red" mb={4}>
                <WarningIcon mr={2} mb={1} />
                {errors.root.message}
              </Text>
            )}
            <FormControl isInvalid={!!errors.password?.message}>
              <FormLabel>Enter password:</FormLabel>
              <PasswordInput register={register('password')} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              size="lg"
              variant="solid"
              mt={4}
              width="100%"
              onClick={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Importing...' : 'Import wallet'}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default ImportScreen;
