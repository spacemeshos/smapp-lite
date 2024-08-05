import { useEffect } from 'react';
import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
  Image,
  Box,
} from '@chakra-ui/react';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import BackButton from '../../components/BackButton';
import PasswordInput from '../../components/PasswordInput';
import useWallet from '../../store/useWallet';

import { useWalletCreation } from './WalletCreationContext';
import logo from '../../assets/logo_white.svg';

type FormValues = {
  password: string;
  confirm: string;
};

function SetPasswordScreen(): JSX.Element {
  const {
    register,
    reset,
    control,
    formState: { errors, isSubmitted },
    handleSubmit,
  } = useForm<FormValues>();
  const ctx = useWalletCreation();
  const navigate = useNavigate();
  const { createWallet } = useWallet();

  useEffect(() => {
    if (ctx.mnemonic.length === 0) {
      navigate('/');
    }
  }, [ctx.mnemonic, navigate]);

  const onSubmit = handleSubmit((vals) => {
    ctx.setPassword(vals.password);
    createWallet(vals.password, ctx.mnemonic);
    navigate('/wallet');
  });

  return (
    <Flex flexDir="column" alignItems="center">
      <Image src={logo} width={200} mb={8} />

      <Card
        fontSize="sm"
        paddingX={20}
        paddingTop={20}
        paddingBottom={16}
        w="50vw"
      >
        <CardHeader>
          <Text fontSize="xl" mb={4} mt={2} textAlign="center">
            Final step to access your wallet
          </Text>
        </CardHeader>
        <CardBody>
          <Form control={control}>
            <FormControl
              isRequired
              isInvalid={isSubmitted && !!errors.password?.message}
              mb={4}
            >
              <Flex w="100%" flexDir="column" alignItems="center">
                <FormLabel>Set the password:</FormLabel>
                <PasswordInput
                  register={register('password', {
                    required: {
                      value: true,
                      message: 'Password cannot be empty',
                    },
                    minLength: {
                      value: 8,
                      message: 'Password should be at least 8 characters long',
                    },
                    validate: (val) => {
                      const hasUpperCase = /[A-Z]/.test(val);
                      const hasLowerCase = /[a-z]/.test(val);
                      const hasNumbers = /\d/.test(val);
                      const hasNonalphas = /\W/.test(val);
                      if (
                        !(
                          hasUpperCase &&
                          hasLowerCase &&
                          hasNumbers &&
                          hasNonalphas
                        )
                      ) {
                        // eslint-disable-next-line max-len
                        return 'Password should contain symbols in upper and lower cases, numbers, and special characters';
                      }
                      return undefined;
                    },
                  })}
                />
                {errors.password?.message && (
                  <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                )}
              </Flex>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={isSubmitted && !!errors.confirm?.message}
              mb={4}
            >
              <Flex w="100%" flexDir="column" alignItems="center">
                <FormLabel>Confirm the password:</FormLabel>
                <PasswordInput
                  register={register('confirm', {
                    validate: (val, formVals) => {
                      if (val !== formVals.password) {
                        // eslint-disable-next-line max-len
                        return 'Your passwords do not match';
                      }
                      return undefined;
                    },
                  })}
                />
                {errors.confirm?.message && (
                  <FormErrorMessage>{errors.confirm.message}</FormErrorMessage>
                )}
              </Flex>
            </FormControl>
            <Flex width="100%" justifyContent="center" pt={10}>
              <Button
                type="submit"
                colorScheme="green"
                onClick={onSubmit}
                rightIcon={<IconArrowNarrowRight />}
              >
                Create wallet
              </Button>
            </Flex>
          </Form>
        </CardBody>
      </Card>
      <Flex width="100%" justifyContent="flex-start">
        <BackButton onClick={reset} />
      </Flex>
    </Flex>
  );
}

export default SetPasswordScreen;
