import { useCallback, useEffect, useState } from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormUnregister,
} from 'react-hook-form';

import { Flex, FormControl, FormLabel, Select, Text } from '@chakra-ui/react';
import { O, pipe } from '@mobily/ts-belt';
import { StdTemplateKeys } from '@spacemesh/sm-codec';

import { useCurrentGenesisID } from '../../hooks/useNetworkSelectors';
import useAccountData from '../../store/useAccountData';
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
  setValue: UseFormSetValue<FormValues>;
};

function SpawnAnotherAccount({
  accounts,
  register,
  unregister,
  setValue,
}: SpawnAnotherAccount) {
  const genesisID = useCurrentGenesisID();
  const { isSpawnedAccount } = useAccountData();
  const isSpawned = useCallback(
    (acc: AccountWithAddress<AnySpawnArguments>) =>
      pipe(
        genesisID,
        O.mapWithDefault(false, (genesis) =>
          isSpawnedAccount(genesis, acc.address)
        )
      ),
    [genesisID, isSpawnedAccount]
  );

  useEffect(() => {
    if (accounts.length > 0) {
      const firstUnspawned = accounts.find((x) => !isSpawned(x));
      if (firstUnspawned) {
        setSelectedAddress(firstUnspawned.address);
        setValue(
          'templateAddress',
          firstUnspawned.templateAddress as StdTemplateKeys
        );
      }
    }
  }, [accounts, isSpawned, setValue]);

  const [selectedAddress, setSelectedAddress] = useState(
    accounts.find((x) => !isSpawned(x))?.address
  );

  const selectAccount = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const account = accounts.find((acc) => acc.address === e.target.value);
      if (account) {
        setSelectedAddress(e.target.value);
        setValue('templateAddress', account.templateAddress as StdTemplateKeys);
      }
    },
    [accounts, setValue]
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
    <Flex flexDir="column">
      <FormControl mb={2}>
        <FormLabel>Please select account to spawn:</FormLabel>
        <Select
          variant="whitePill"
          onChange={selectAccount}
          value={selectedAddress}
        >
          {accounts.map((acc) => (
            <option
              key={`${acc.address}_${acc.displayName}`}
              value={acc.address}
              disabled={isSpawned(acc)}
            >
              {acc.displayName} ({acc.address})
            </option>
          ))}
        </Select>
      </FormControl>
      {renderDetails()}
    </Flex>
  );
}

export default SpawnAnotherAccount;
