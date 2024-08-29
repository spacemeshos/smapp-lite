import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  get,
  Path,
  PathValue,
  UseFormGetValues,
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
  getValues: UseFormGetValues<T>;
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
  getValues,
}: Props<T, FieldName>): JSX.Element {
  const [origin, setOrigin] = useState(
    defaultForeign ? Origin.Foreign : Origin.Local
  );
  const prevOrigin = useRef(origin);
  useEffect(() => () => unregister(fieldName), [unregister, fieldName, origin]);
  useEffect(() => {
    const firstLocal = accounts?.[0]?.address;
    const val = getValues(fieldName);
    const foundVal = accounts.find((x) => x.address === val);
    if (
      prevOrigin.current !== origin &&
      origin === Origin.Local &&
      !!firstLocal &&
      !foundVal
    ) {
      setValue(fieldName, firstLocal as PathValue<T, FieldName>);
    }
  }, [prevOrigin, origin, accounts, setValue, fieldName, getValues]);

  const error = get(errors, fieldName) as FieldError | undefined;
  const renderInputs = () => {
    switch (origin) {
      case Origin.Foreign:
        return (
          <Input
            {...register(fieldName, {
              required: isRequired ? 'Please pick the address' : false,
              value: (!defaultForeign
                ? accounts[0]?.address ?? ''
                : '') as PathValue<T, FieldName>,
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
        onChange={(next) => {
          prevOrigin.current = origin;
          setOrigin(next as Origin);
        }}
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
          <FormErrorMessage textColor="brand.red">
            {error.message as ReactNode}
          </FormErrorMessage>
        )}
      </FormControl>
    </>
  );
}

export default FormAddressSelect;
