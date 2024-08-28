import { useState } from 'react';
import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
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
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="space-around"
      minH="90vh"
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}
      >
        <Text
          fontSize="xl"
          mb={12}
          fontFamily="Univers65"
          size={{ base: '16px', md: '20px' }}
        >
          Unlock Wallet
        </Text>
        <Form control={control}>
          <FormControl isInvalid={!!errors.password?.message}>
            <PasswordInput
              register={register('password')}
              inputProps={
                errors.password?.message
                  ? {
                      minW: '300px',
                      borderColor: 'brand.red',
                      _hover: { borderColor: 'brand.red' },
                      _focus: { borderColor: 'brand.red' },
                    }
                  : { minW: '300px' }
              }
            />
            <FormErrorMessage textColor="brand.red">
              {errors.password?.message}
            </FormErrorMessage>
          </FormControl>

          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              type="submit"
              mt={4}
              px={10}
              onClick={() => submit()}
              size="md"
              alignSelf="center"
              variant="green"
              disabled={isLoading}
            >
              {isLoading ? 'Unlocking...' : 'Unlock'}
            </Button>
          </Box>
        </Form>
      </Flex>
      <Box mb={8} textAlign="center" width={380}>
        <Text fontSize="xs" mb={2}>
          If you want to open another wallet file or re-create it from mnemonic,
          please wipe out the current wallet first.
          <br />
          <strong>Please, ensure that you have saved the mnemonic.</strong>
        </Text>
        <Button onClick={wipeAlert.onOpen} size="sm" variant="whiteOutline">
          Wipe out
        </Button>
      </Box>
      <WipeOutAlert disclosure={wipeAlert} />
    </Flex>
  );
}

export default UnlockScreen;
