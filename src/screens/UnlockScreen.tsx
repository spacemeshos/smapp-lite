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
          Welcome back!
        </Text>
        <Form control={control}>
          <FormControl isInvalid={!!errors.password?.message}>
            <PasswordInput register={register('password')} />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            mt={4}
            onClick={() => submit()}
            size="lg"
            width="full"
          >
            Unlock
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
