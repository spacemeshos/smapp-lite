import { useEffect } from 'react';
import { UseFormRegister, UseFormUnregister } from 'react-hook-form';

import { Text } from '@chakra-ui/react';

import { SingleSigSpawnArguments } from '../../utils/templates';
import FormInputViewOnly from '../FormInputViewOnly';

import { FormValues } from './schemas';

type SingleSigSpawnProps = {
  spawnArguments: SingleSigSpawnArguments;
  register: UseFormRegister<FormValues>;
  unregister: UseFormUnregister<FormValues>;
};

function SingleSigSpawn({
  spawnArguments: args,
  register,
  unregister,
}: SingleSigSpawnProps): JSX.Element {
  useEffect(() => {
    register('payload.PublicKey', { value: args.PublicKey });
    return () => unregister('payload.PublicKey');
  }, [args, register, unregister]);

  return (
    <>
      <Text fontSize="sm" mt={2} textAlign="center" color="brand.gray">
        Spawn arguments are taken from Account settings.
      </Text>
      <FormInputViewOnly label="Public Key" value={args.PublicKey} />
    </>
  );
}

export default SingleSigSpawn;
