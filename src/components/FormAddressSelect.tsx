import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  get,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormUnregister,
} from 'react-hook-form';

import {
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from '@chakra-ui/react';

import { Bech32AddressSchema } from '../api/schemas/address';
import { AccountWithAddress } from '../types/wallet';

enum Origin {
  Local = 'local',
  Foreign = 'foreign',
}

type Props<
  T extends FieldValues,
  FieldName extends Path<T>
> = PropsWithChildren<{
  fieldName: FieldName;
  accounts: AccountWithAddress[];
  register: UseFormRegister<T>;
  unregister: UseFormUnregister<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  isRequired?: boolean;
  defaultForeign?: boolean;
}>;

function FormAddressSelect<T extends FieldValues, FieldName extends Path<T>>({
  fieldName,
  accounts,
  register,
  unregister,
  errors,
  isSubmitted = false,
  isRequired = false,
  children = '',
  defaultForeign = false,
  setValue,
}: Props<T, FieldName>): JSX.Element {
  const [origin, setOrigin] = useState(
    defaultForeign ? Origin.Foreign : Origin.Local
  );
  useEffect(() => () => unregister(fieldName), [unregister, fieldName, origin]);
  useEffect(() => {
    const firstLocal = accounts?.[0]?.address;
    if (origin === Origin.Local && !!firstLocal) {
      setValue(fieldName, firstLocal as PathValue<T, FieldName>);
    }
  }, [origin, accounts, setValue, fieldName]);

  const error = get(errors, fieldName) as FieldError | undefined;
  const renderInputs = () => {
    switch (origin) {
      case Origin.Foreign:
        return (
          <Input
            {...register(fieldName, {
              required: isRequired ? 'Please pick the address' : false,
              validate: (val) => {
                try {
                  Bech32AddressSchema.parse(val);
                  return true;
                } catch (err) {
                  return false;
                }
              },
            })}
          />
        );
      case Origin.Local:
      default:
        return (
          <Select {...register(fieldName)}>
            {accounts.map((acc) => (
              <option
                key={`${acc.address}_${acc.displayName}`}
                value={acc.address}
              >
                {acc.displayName} ({acc.address})
              </option>
            ))}
          </Select>
        );
    }
  };

  return (
    <>
      <RadioGroup
        size="sm"
        onChange={(next) => setOrigin(next as Origin)}
        value={origin}
        mb={1}
      >
        <Stack direction="row">
          <Radio value={Origin.Local}>Local Address</Radio>
          <Radio value={Origin.Foreign}>Foreign Address</Radio>
        </Stack>
      </RadioGroup>
      <FormControl
        isRequired={isRequired}
        isInvalid={isSubmitted && !!error?.message}
        mt={2}
        mb={2}
      >
        <InputGroup>
          {renderInputs()}
          {children}
        </InputGroup>
        {error?.message && (
          <FormErrorMessage>{error.message as ReactNode}</FormErrorMessage>
        )}
      </FormControl>
    </>
  );
}

export default FormAddressSelect;
