import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
} from '@chakra-ui/react';

import PasswordInput from '../components/PasswordInput';
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
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const submit = handleSubmit(async (data) => {
    const success = await unlockWallet(data.password);
    if (!success) {
      setError('password', { type: 'value', message: 'Invalid password' });
      return;
    }
    navigate('/wallet');
  });

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      h="100vh"
      fontSize="3xl"
    >
      <Text fontSize="xl" mb={4}>
        Unlock wallet
      </Text>
      <Form control={control}>
        <FormControl isInvalid={!!errors.password?.message}>
          <FormLabel>Enter password:</FormLabel>
          <PasswordInput register={register('password', { required: true })} />
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>
        <Button type="submit" mt={4} onClick={() => submit()} size="lg">
          Unlock
        </Button>
      </Form>
    </Flex>
  );
}

export default UnlockScreen;
