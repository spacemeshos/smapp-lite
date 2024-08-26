import { useState } from 'react';
import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import PasswordInput from '../components/PasswordInput';
import WipeOutAlert from '../components/WipeOutAlert';
import useWallet from '../store/useWallet';

type FormValues = {
  password: string;
};

function UnlockScreen(): JSX.Element {
  const { unlockWallet } = useWallet();
  const navigate = useNavigate();
  const {
    register,
    control,
    setError,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);

  const submit = handleSubmit(async (data) => {
    setIsLoading(true);
    const success = await unlockWallet(data.password);
    if (!success) {
      setError('password', { type: 'value', message: 'Invalid password' });
      return;
    }
    setValue('password', '');
    reset();
    setIsLoading(false);
    navigate('/wallet');
  });

  const wipeAlert = useDisclosure();

  return (
    <>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}
        fontSize="3xl"
      >
        <Text fontSize="xl" mb={4}>
          Unlock wallet
        </Text>
        <Form control={control}>
          <FormControl isInvalid={!!errors.password?.message}>
            <FormLabel>Enter password:</FormLabel>
            <PasswordInput register={register('password')} />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            mt={4}
            onClick={() => submit()}
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </Button>
        </Form>
      </Flex>
      <Box mt={6} mb={2} textAlign="center" maxW={360}>
        <Text fontSize="xs" mb={2}>
          If you want to open another wallet file or re-create it from mnemonic,
          please wipe out the current wallet first.
          <br />
          <strong>Please, ensure that you have saved the mnemonic.</strong>
        </Text>
        <Button
          onClick={wipeAlert.onOpen}
          colorScheme="red"
          size="sm"
          variant="outline"
        >
          Wipe out
        </Button>
      </Box>
      <WipeOutAlert disclosure={wipeAlert} />
    </>
  );
}

export default UnlockScreen;
