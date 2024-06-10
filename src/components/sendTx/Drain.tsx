import { useEffect } from 'react';
import {
  FieldErrors,
  UseFormRegister,
  UseFormUnregister,
} from 'react-hook-form';

import { FormControl, FormLabel } from '@chakra-ui/react';
import { StdPublicKeys } from '@spacemesh/sm-codec';

import { AccountWithAddress } from '../../types/wallet';
import { noop } from '../../utils/func';
import FormAddressSelect from '../FormAddressSelect';
import FormInput from '../FormInput';

import { FormValues } from './schemas';

type DrainProps = {
  accounts: AccountWithAddress[];
  register: UseFormRegister<FormValues>;
  unregister: UseFormUnregister<FormValues>;
  errors: FieldErrors<FormValues>;
  isSubmitted: boolean;
};

function Drain({
  accounts,
  register,
  unregister,
  errors,
  isSubmitted,
}: DrainProps): JSX.Element {
  useEffect(
    () => () => {
      unregister('payload.vault');
      unregister('payload.destination');
      unregister('payload.amount');
    },
    [register, unregister]
  );

  const vaults = accounts.filter(
    (acc) => acc.templateAddress === StdPublicKeys.Vault
  );

  return (
    <>
      <FormControl isRequired>
        <FormLabel fontSize="sm" mb={0}>
          Vault Address:
        </FormLabel>
        <FormAddressSelect
          fieldName="payload.vault"
          accounts={vaults}
          register={register}
          unregister={noop} // avoid unregistering address on unmount
          errors={errors}
          isSubmitted={isSubmitted}
          isRequired
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel fontSize="sm" mb={0}>
          Destination Address:
        </FormLabel>
        <FormAddressSelect
          fieldName="payload.destination"
          accounts={accounts}
          register={register}
          unregister={noop} // avoid unregistering address on unmount
          errors={errors}
          isSubmitted={isSubmitted}
          isRequired
        />
      </FormControl>
      <FormInput
        label="Amount"
        inputProps={{ type: 'number' }}
        register={register('payload.amount', {
          value: '0',
          setValueAs: (val: string) => BigInt(val).toString(),
        })}
        errors={errors}
        isSubmitted={isSubmitted}
      />
    </>
  );
}

export default Drain;
