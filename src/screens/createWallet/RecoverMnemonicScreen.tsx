import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Button, Card, CardBody, Text } from '@chakra-ui/react';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import BackButton from '../../components/BackButton';
import FormTextarea from '../../components/FormTextarea';
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
    <>
      <BackButton />
      <Text fontSize="xl" mb={4} mt={2}>
        Recover wallet from mnemonics
      </Text>
      <Card fontSize="sm" borderRadius="xl" w="100%">
        <CardBody>
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
