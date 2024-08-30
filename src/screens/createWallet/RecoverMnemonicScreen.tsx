import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Flex } from '@chakra-ui/react';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import BackButton from '../../components/BackButton';
import FormTextarea from '../../components/FormTextarea';
import GreenHeader from '../../components/welcome/GreenHeader';
import Logo from '../../components/welcome/Logo';
import { normalizeMnemonic } from '../../utils/mnemonic';

import { useWalletCreation } from './WalletCreationContext';

type FormValues = {
  mnemonic: string;
};

function RecoverMnemonicScreen(): JSX.Element {
  const ctx = useWalletCreation();
  const navigate = useNavigate();
  const {
    control,
    register,
    formState: { errors, isSubmitted },
    handleSubmit,
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(({ mnemonic }) => {
    ctx.setMnemonic(mnemonic);
    navigate('/create/set-password');
  });

  return (
    <Flex flexDir="column" alignItems="center">
      <Logo />

      <Box px={4} w={{ base: '100%', md: '90%' }} textAlign="center">
        <GreenHeader>Recover wallet from mnemonics</GreenHeader>
      </Box>
      <Box
        mt={4}
        w={{ base: '80%', md: '60%' }}
        minW="280px"
        maxW="360px"
        textAlign="center"
      >
        <Form control={control}>
          <FormTextarea
            label="Please put your 12-word or 24-word mnemonic:"
            register={register('mnemonic', {
              required: true,
              setValueAs: normalizeMnemonic,
              validate: (value) => {
                const words = value.split(' ');
                if (words.length !== 12 && words.length !== 24) {
                  return 'Invalid mnemonic length';
                }
                if (!validateMnemonic(value, wordlist)) {
                  return 'Invalid mnemonic words';
                }
                return undefined;
              },
            })}
            errors={errors}
            isSubmitted={isSubmitted}
          />
        </Form>
      </Box>
      <Flex width="100%" justifyContent="space-between" pt={10}>
        <BackButton />

        <Button
          type="submit"
          paddingY={2}
          paddingX={4}
          onClick={onSubmit}
          variant="green"
        >
          Next step
        </Button>
      </Flex>
    </Flex>
  );
}

export default RecoverMnemonicScreen;
