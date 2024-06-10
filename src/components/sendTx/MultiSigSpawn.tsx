import { useEffect } from 'react';
import { UseFormRegister, UseFormUnregister } from 'react-hook-form';

import { Text } from '@chakra-ui/react';

import { normalizeHexString } from '../../utils/hexString';
import { MultiSigSpawnArguments } from '../../utils/templates';
import FormInputViewOnly from '../FormInputViewOnly';

import { FormValues } from './schemas';

type MultiSigSpawnProps = {
  spawnArguments: MultiSigSpawnArguments;
  register: UseFormRegister<FormValues>;
  unregister: UseFormUnregister<FormValues>;
};

function MultiSigSpawn({
  spawnArguments: args,
  register,
  unregister,
}: MultiSigSpawnProps): JSX.Element {
  useEffect(() => {
    register('payload.publicKeys', { value: args.PublicKeys });
    register('payload.required', { value: args.Required });
    return () => {
      unregister('payload.publicKeys');
      unregister('payload.required');
    };
  }, [args, register, unregister]);

  return (
    <>
      <Text fontSize="sm" mb={1}>
        Spawn arguments are taken from Account settings.
      </Text>
      <FormInputViewOnly
        label="Required signatures"
        inputProps={{ type: 'number' }}
        value={String(args.Required)}
      />
      {args.PublicKeys.map((pk) => (
        <FormInputViewOnly
          key={`${pk}`}
          label="Public Key"
          value={normalizeHexString(pk)}
        />
      ))}
    </>
  );
}

export default MultiSigSpawn;
