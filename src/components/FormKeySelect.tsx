import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  get,
  Path,
  PathValue,
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
import { CREATE_NEW_KEY_LITERAL } from '../utils/constants';

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
  defaultForeign?: boolean;
  value?: string | null;
  hasCreateOption?: boolean;
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
  isSubmitted = false,
  isRequired = false,
  children = '',
  value = null,
  hasCreateOption = false,
}: Props<T, FieldName>): JSX.Element {
  const isLocalValue =
    !value ||
    (hasCreateOption && value === CREATE_NEW_KEY_LITERAL) ||
    keys.some((key) => key.publicKey === value);
  const [keyType, setKeyType] = useState(
    isLocalValue ? KeyType.Local : KeyType.Foreign
  );
  const formValue = (value || '') as PathValue<T, FieldName>;

  useEffect(() => {
    if (keys.some((key) => key.publicKey === value)) {
      setKeyType(KeyType.Local);
    }
    if (!value) {
      setKeyType(KeyType.Foreign);
    }
  }, [keys, value]);

  useEffect(() => {
    if (!hasCreateOption) return;
    if (keyType === KeyType.Local && formValue === '') {
      register(fieldName, {
        value: CREATE_NEW_KEY_LITERAL as PathValue<T, FieldName>,
      });
    }
  }, [fieldName, formValue, hasCreateOption, keyType, register]);

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
              value: formValue,
              required: isRequired ? 'Please pick the key' : false,
              validate: (val) =>
                isHexString(val) ? true : 'Invalid Hex format',
            })}
          />
        );
      case KeyType.Local:
      default:
        return (
          <Select {...register(fieldName, { value: formValue })}>
            {hasCreateOption && (
              <>
                <option value={CREATE_NEW_KEY_LITERAL}>Create New Key</option>
                <option disabled>--------------------</option>
              </>
            )}
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
          <FormErrorMessage textColor="brand.red">
            {error.message as ReactNode}
          </FormErrorMessage>
        )}
      </FormControl>
    </>
  );
}

export default FormKeySelect;
