import { useCallback, useState } from 'react';
import { UseFormRegister, UseFormUnregister } from 'react-hook-form';

import { FormControl, FormLabel, Select, Text } from '@chakra-ui/react';

import { AccountWithAddress } from '../../types/wallet';
import {
  isMultiSigAccount,
  isSingleSigAccount,
  isVaultAccount,
  isVestingAccount,
} from '../../utils/account';
import { AnySpawnArguments } from '../../utils/templates';

import MultiSigSpawn from './MultiSigSpawn';
import { FormValues } from './schemas';
import SingleSigSpawn from './SingleSigSpawn';
import VaultSpawn from './VaultSpawn';

type SpawnAnotherAccount = {
  accounts: AccountWithAddress<AnySpawnArguments>[];
  register: UseFormRegister<FormValues>;
  unregister: UseFormUnregister<FormValues>;
};

function SpawnAnotherAccount({
  accounts,
  register,
  unregister,
}: SpawnAnotherAccount) {
  const [selectedAddress, setSelectedAddress] = useState(accounts[0]?.address);

  const selectAccount = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedAddress(e.target.value);
    },
    []
  );

  const selectedAccount = accounts.find((x) => x.address === selectedAddress);

  const renderDetails = () => {
    if (!selectedAccount) {
      throw new Error('WTF'); // TODO
    }
    if (isSingleSigAccount(selectedAccount)) {
      return (
        <SingleSigSpawn
          spawnArguments={selectedAccount.spawnArguments}
          register={register}
          unregister={unregister}
        />
      );
    }
    if (
      isMultiSigAccount(selectedAccount) ||
      isVestingAccount(selectedAccount)
    ) {
      return (
        <MultiSigSpawn
          spawnArguments={selectedAccount.spawnArguments}
          register={register}
          unregister={unregister}
        />
      );
    }
    if (isVaultAccount(selectedAccount)) {
      return (
        <VaultSpawn
          spawnArguments={selectedAccount.spawnArguments}
          register={register}
          unregister={unregister}
        />
      );
    }
    return (
      <Text fontSize="sm" color="orange">
        Cannot find details for the selected account.
        <br />
        Please choose the account from the drop down above.
      </Text>
    );
  };

  return (
    <>
      <FormControl>
        <FormLabel>Please select account to spawn:</FormLabel>
        <Select onChange={selectAccount} value={selectedAddress}>
          {accounts.map((acc) => (
            <option
              key={`${acc.address}_${acc.displayName}`}
              value={acc.address}
            >
              {acc.displayName} ({acc.address})
            </option>
          ))}
        </Select>
      </FormControl>
      {renderDetails()}
    </>
  );
}

export default SpawnAnotherAccount;
