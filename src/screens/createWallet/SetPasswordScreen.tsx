import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/react';

import BackButton from '../../components/BackButton';
import PasswordInput from '../../components/PasswordInput';
import useWallet from '../../store/useWallet';

import { useWalletCreation } from './WalletCreationContext';

type FormValues = {
  password: string;
  confirm: string;
};

function SetPasswordScreen(): JSX.Element {
  const {
    register,
    reset,
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
    <>
      <BackButton onClick={reset} />
      <FormControl
        isRequired
        isInvalid={isSubmitted && !!errors.password?.message}
        mb={4}
      >
        <FormLabel>Set the password:</FormLabel>
        <PasswordInput
          register={register('password', {
            required: {
              value: true,
              message: 'Password cannot be empty',
            },
            minLength: {
              value: 8,
              message: 'Password should be at least 8 characters length',
            },
            validate: (val) => {
              const hasUpperCase = /[A-Z]/.test(val);
              const hasLowerCase = /[a-z]/.test(val);
              const hasNumbers = /\d/.test(val);
              const hasNonalphas = /\W/.test(val);
              if (
                !(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)
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
      </FormControl>
      <FormControl
        isRequired
        isInvalid={isSubmitted && !!errors.confirm?.message}
        mb={4}
      >
        <FormLabel>Confirm the password:</FormLabel>
        <PasswordInput
          register={register('confirm', {
            validate: (val, formVals) => {
              if (val !== formVals.password) {
                // eslint-disable-next-line max-len
                return 'Your passwords do no match';
              }
              return undefined;
            },
          })}
        />
        {errors.confirm?.message && (
          <FormErrorMessage>{errors.confirm.message}</FormErrorMessage>
        )}
      </FormControl>
      <Button colorScheme="green" onClick={onSubmit}>
        Create wallet
      </Button>
    </>
  );
}

export default SetPasswordScreen;
