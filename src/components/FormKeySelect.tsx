import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  get,
  Path,
  UseFormRegister,
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

import { isHexString } from '../types/common';
import { SafeKey } from '../types/wallet';
import { getAbbreviatedHexString } from '../utils/abbr';

type Props<
  T extends FieldValues,
  FieldName extends Path<T>
> = PropsWithChildren<{
  fieldName: FieldName;
  keys: SafeKey[];
  register: UseFormRegister<T>;
  unregister: UseFormUnregister<T>;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  isRequired?: boolean;
}>;

enum KeyType {
  Local = 'local',
  Foreign = 'foreign',
}

function FormKeySelect<T extends FieldValues, FieldName extends Path<T>>({
  fieldName,
  keys,
  register,
  unregister,
  errors,
  isSubmitted,
  isRequired,
  children,
}: Props<T, FieldName>): JSX.Element {
  const [keyType, setKeyType] = useState(KeyType.Local);
  useEffect(
    () => () => unregister(fieldName),
    [unregister, fieldName, keyType]
  );

  const error = get(errors, fieldName) as FieldError | undefined;
  const renderInputs = () => {
    switch (keyType) {
      case KeyType.Foreign:
        return (
          <Input
            {...register(fieldName, {
              required: isRequired ? 'Please pick the key' : false,
              validate: (val) =>
                isHexString(val) ? true : 'Invalid Hex format',
            })}
          />
        );
      case KeyType.Local:
      default:
        return (
          <Select {...register(fieldName)}>
            {keys.map((key) => (
              <option key={key.publicKey} value={key.publicKey}>
                {key.displayName} ({getAbbreviatedHexString(key.publicKey)})
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
        onChange={(next) => setKeyType(next as KeyType)}
        value={keyType}
        mb={1}
      >
        <Stack direction="row">
          <Radio value={KeyType.Local}>Local Key</Radio>
          <Radio value={KeyType.Foreign}>Foreign Key</Radio>
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

FormKeySelect.defaultProps = {
  isSubmitted: false,
  isRequired: false,
  children: '',
};

export default FormKeySelect;
