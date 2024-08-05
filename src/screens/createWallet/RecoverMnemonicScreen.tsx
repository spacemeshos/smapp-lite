import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Text,
  Image,
} from '@chakra-ui/react';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import BackButton from '../../components/BackButton';
import FormTextarea from '../../components/FormTextarea';
import { normalizeMnemonic } from '../../utils/mnemonic';

import { useWalletCreation } from './WalletCreationContext';
import logo from '../../assets/logo_white.svg';

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
      <Image src={logo} width={200} my={8} />

      <Card fontSize="sm" w="100%" padding={12} marginTop="20%">
        <CardHeader>
          <Text fontSize="xl" mb={4} mt={2} textAlign="center">
            Recover wallet from mnemonics
          </Text>
        </CardHeader>
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
          </Form>
        </CardBody>
      </Card>
      <Flex width="100%" justifyContent="space-between" pt={10}>
        <BackButton />

        <Button type="submit" pt={2} pb={2} pl={4} pr={4} onClick={onSubmit}>
          Next step
        </Button>
      </Flex>
    </Flex>
  );
}

export default RecoverMnemonicScreen;
