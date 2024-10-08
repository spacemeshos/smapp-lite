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
    register('payload.Owner', { value: args.Owner });
    register('payload.TotalAmount', {
      value: String(BigInt(args.TotalAmount)),
    });
    register('payload.InitialUnlockAmount', {
      value: String(BigInt(args.InitialUnlockAmount)),
    });
    register('payload.VestingStart', { value: args.VestingStart });
    register('payload.VestingEnd', { value: args.VestingEnd });
    return () => {
      unregister('payload.Owner');
      unregister('payload.TotalAmount');
      unregister('payload.InitialUnlockAmount');
      unregister('payload.VestingStart');
      unregister('payload.VestingEnd');
    };
  }, [args, register, unregister]);

  return (
    <>
      <Text fontSize="sm" textAlign="center" color="brand.gray">
        Spawn arguments are taken from Account settings.
      </Text>
      <FormInputViewOnly label="Owner address" value={String(args.Owner)} />
      <FormInputViewOnly
        label="Total amount"
        inputProps={{ type: 'number' }}
        value={String(args.TotalAmount)}
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
