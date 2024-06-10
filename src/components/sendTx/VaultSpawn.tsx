import { useEffect } from 'react';
import { UseFormRegister, UseFormUnregister } from 'react-hook-form';

import { Text } from '@chakra-ui/react';

import { VaultSpawnArguments } from '../../utils/templates';
import FormInputViewOnly from '../FormInputViewOnly';

import { FormValues } from './schemas';

type VaultSpawnProps = {
  spawnArguments: VaultSpawnArguments;
  register: UseFormRegister<FormValues>;
  unregister: UseFormUnregister<FormValues>;
};

function VaultSpawn({
  spawnArguments: args,
  register,
  unregister,
}: VaultSpawnProps): JSX.Element {
  useEffect(() => {
    register('payload.owner', { value: args.Owner });
    register('payload.totalAmount', { value: args.TotalAmount });
    register('payload.initialUnlockAmount', {
      value: args.InitialUnlockAmount,
    });
    register('payload.vestingStart', { value: args.VestingStart });
    register('payload.vestingEnd', { value: args.VestingEnd });
    return () => {
      unregister('payload.owner');
      unregister('payload.totalAmount');
      unregister('payload.initialUnlockAmount');
      unregister('payload.vestingStart');
      unregister('payload.vestingEnd');
    };
  }, [args, register, unregister]);

  return (
    <>
      <Text fontSize="sm" mb={1}>
        Spawn arguments are taken from Account settings.
      </Text>
      <FormInputViewOnly label="Owner address" value={String(args.Owner)} />
      <FormInputViewOnly
        label="Total amount"
        inputProps={{ type: 'number' }}
        value={String(args.TotalAmount)}
      />
      <FormInputViewOnly
        label="Initial unlock amount"
        inputProps={{ type: 'number' }}
        value={String(args.InitialUnlockAmount)}
      />
      <FormInputViewOnly
        label="Vesting Start (layer)"
        inputProps={{ type: 'number' }}
        value={String(args.VestingStart)}
      />
      <FormInputViewOnly
        label="Vesting End (layer)"
        inputProps={{ type: 'number' }}
        value={String(args.VestingEnd)}
      />
    </>
  );
}

export default VaultSpawn;
