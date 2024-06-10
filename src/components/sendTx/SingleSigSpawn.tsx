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
    register('payload.publicKey', { value: args.PublicKey });
    return () => unregister('payload.publicKey');
  }, [args, register, unregister]);

  return (
    <>
      <Text fontSize="sm" mb={1}>
        Spawn arguments are taken from Account settings.
      </Text>
      <FormInputViewOnly label="Public Key" value={args.PublicKey} />
    </>
  );
}

export default SingleSigSpawn;
