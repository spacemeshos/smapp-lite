import { useCallback, useEffect } from 'react';
import {
  ArrayPath,
  Control,
  FieldArray,
  FieldErrors,
  FieldValues,
  Path,
  useFieldArray,
  UseFormRegister,
  UseFormUnregister,
} from 'react-hook-form';

import { Button, IconButton, Text } from '@chakra-ui/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { SafeKey } from '../types/wallet';
import {
  BUTTON_ICON_SIZE,
  CREATE_NEW_KEY_LITERAL,
  MAX_MULTISIG_AMOUNT,
} from '../utils/constants';

import FormKeySelect from './FormKeySelect';

type Props<T extends FieldValues, FieldName extends ArrayPath<T>> = {
  fieldName: FieldName;
  keys: SafeKey[];
  control: Control<T>;
  register: UseFormRegister<T>;
  unregister: UseFormUnregister<T>;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  values?: string[] | null;
  hasCreateOption?: boolean;
  autoSelectKeys?: null | SafeKey[];
};
function FormMultiKeySelect<
  T extends FieldValues,
  FieldName extends ArrayPath<T>
>({
  fieldName,
  keys,
  control,
  register,
  unregister,
  errors,
  isSubmitted = false,
  values = null,
  hasCreateOption = false,
  autoSelectKeys = null,
}: Props<T, FieldName>): JSX.Element {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });
  const addEmptyField = useCallback(
    () =>
      append(
        `0x${String(fields.length).padStart(2, '0')}` as FieldArray<
          T,
          FieldName
        >
      ),
    [append, fields.length]
  );

  useEffect(() => {
    if (!values || values.length === 0) {
      append((keys?.[0]?.publicKey || '0x01') as FieldArray<T, FieldName>);
    } else {
      // In case there are some values — restore them in the form
      values.forEach((v) => append(v as FieldArray<T, FieldName>));
    }
    return () => remove();
  }, [values, append, remove, keys]);

  const getSelectValue = useCallback(
    (index: number) => {
      const nextRecommendedKey = autoSelectKeys
        ? autoSelectKeys[index]?.publicKey
        : keys[index]?.publicKey;
      const defaultKey = hasCreateOption
        ? CREATE_NEW_KEY_LITERAL
        : `0x${String(index).padStart(2, '0')}`;
      const nextKey = nextRecommendedKey ?? defaultKey;
      return values?.[index] || nextKey;
    },
    [autoSelectKeys, hasCreateOption, keys, values]
  );

  const rootError = errors[fieldName]?.message;
  return (
    <>
      {rootError && (
        <Text color="red" mb={2}>
          {rootError as string}
        </Text>
      )}
      {fields.map((field, index) => (
        <FormKeySelect
          key={field.id}
          fieldName={`${fieldName}.${index}` as Path<T>}
          keys={keys}
          register={register}
          unregister={unregister}
          errors={errors}
          isSubmitted={isSubmitted}
          isRequired
          value={getSelectValue(index)}
          hasCreateOption={hasCreateOption}
        >
          <IconButton
            icon={<IconTrash size={BUTTON_ICON_SIZE} />}
            isDisabled={index === 0}
            onClick={() => remove(index)}
            aria-label="Remove party"
            ml={2}
            variant="ghostWhite"
          />
        </FormKeySelect>
      ))}
      <Button
        type="button"
        onClick={() => addEmptyField()}
        isDisabled={fields.length >= MAX_MULTISIG_AMOUNT}
        variant="whiteModal"
        w="full"
      >
        <IconPlus size={BUTTON_ICON_SIZE} />
        <Text as="span" ml={1}>
          Add party
        </Text>
      </Button>
    </>
  );
}

export default FormMultiKeySelect;
