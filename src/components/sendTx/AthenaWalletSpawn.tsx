import { useEffect } from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormUnregister,
} from 'react-hook-form';

import { Text } from '@chakra-ui/react';

import { AthenaSpawnArguments } from '../../utils/templates';
import FormInputViewOnly from '../FormInputViewOnly';

import { FormValues } from './schemas';

type AthenaWalletSpawnProps = {
  spawnArguments: AthenaSpawnArguments;
  register: UseFormRegister<FormValues>;
  unregister: UseFormUnregister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
};

function AthenaWalletSpawn({
  spawnArguments: args,
  register,
  unregister,
  setValue,
}: AthenaWalletSpawnProps): JSX.Element {
  useEffect(() => {
    register('payload.PublicKey', { value: args.PublicKey });
    register('payload.Nonce', { value: String(args.Nonce) });
    register('payload.Balance', { value: String(args.Balance) });
    return () => {
      unregister('payload.PublicKey');
      unregister('payload.Nonce');
      unregister('payload.Balance');
    };
  }, [args, register, setValue, unregister]);

  return (
    <>
      <Text fontSize="sm" textAlign="center" color="brand.gray">
        Spawn arguments are taken from Account settings.
      </Text>
      <FormInputViewOnly label="Public Key" value={args.PublicKey} />
      <FormInputViewOnly label="Nonce" value={String(args.Nonce)} />
      <FormInputViewOnly label="Balance" value={String(args.Balance)} />
    </>
  );
}

export default AthenaWalletSpawn;
