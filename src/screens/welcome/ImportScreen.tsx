import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, useNavigate } from 'react-router-dom';

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from '@chakra-ui/react';

import BackButton from '../../components/BackButton';
import PasswordInput from '../../components/PasswordInput';
import GreenHeader from '../../components/welcome/GreenHeader';
import Logo from '../../components/welcome/Logo';
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
    <Flex
      flexDir="column"
      alignItems="center"
      w={{ base: '100%', md: '75%' }}
      mb={4}
    >
      <Logo />

      <Box px={4} w={{ base: '100%', md: '90%' }} textAlign="center">
        <GreenHeader>Import wallet file</GreenHeader>
        <Text
          as="strong"
          textAlign="center"
          color="brand.lightGray"
          fontSize={{ base: '16px', md: '20px' }}
          fontFamily="Univers65"
        >
          Please choose the wallet file you want to import.
        </Text>
      </Box>
      <Box
        mt={4}
        w={{ base: '80%', md: '60%' }}
        minW="280px"
        maxW="360px"
        textAlign="center"
      >
        <Form>
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

          <Flex width="100%" justifyContent="space-between" pt={10}>
            <BackButton />

            <Button
              variant="green"
              type="submit"
              pt={2}
              pb={2}
              pl={4}
              pr={4}
              onClick={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Importing...' : 'Import wallet'}
            </Button>
          </Flex>
        </Form>
      </Box>
    </Flex>
  );
}

export default ImportScreen;
