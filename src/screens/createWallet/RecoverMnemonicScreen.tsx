import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import BackButton from '../../components/BackButton';

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
    formState: { errors },
    handleSubmit,
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(({ mnemonic }) => {
    ctx.setMnemonic(mnemonic);
    navigate('/create/set-password');
  });

  return (
    <>
      <BackButton />
      <Text fontSize="xl" mb={4} mt={2}>
        Recover wallet from mnemonics
      </Text>
      <Card fontSize="sm" borderRadius="xl" w="100%">
        <CardBody>
          <Form control={control}>
            <FormControl
              isRequired
              isInvalid={!!errors.mnemonic?.message}
              mb={4}
            >
              <FormLabel>
                Please put your 12-word or 24-word mnemonic:
              </FormLabel>
              <Textarea
                {...register('mnemonic', {
                  required: true,
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
              />
              {errors.mnemonic?.message && (
                <FormErrorMessage>{errors.mnemonic.message}</FormErrorMessage>
              )}
            </FormControl>

            <Button
              type="submit"
              pt={2}
              pb={2}
              pl={4}
              pr={4}
              onClick={onSubmit}
            >
              Next step
            </Button>
          </Form>
        </CardBody>
      </Card>
    </>
  );
}

export default RecoverMnemonicScreen;
