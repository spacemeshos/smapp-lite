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
import { BUTTON_ICON_SIZE, MAX_MULTISIG_AMOUNT } from '../utils/constants';
import { noop } from '../utils/func';

import FormKeySelect from './FormKeySelect';

type Props<T extends FieldValues, FieldName extends ArrayPath<T>> = {
  fieldName: FieldName;
  keys: SafeKey[];
  control: Control<T>;
  register: UseFormRegister<T>;
  unregister: UseFormUnregister<T>;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  values?: string[];
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
  values = [],
}: Props<T, FieldName>): JSX.Element {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });
  const addEmptyField = useCallback(
    () =>
      append(
        (keys[fields.length]?.publicKey ||
          `0x${String(fields.length).padStart(2, '0')}`) as FieldArray<
          T,
          FieldName
        >
      ),
    [append, fields.length, keys]
  );

  useEffect(() => {
    // Have at least one field by default
    if (!values) {
      append(keys[0]?.publicKey as FieldArray<T, FieldName>);
    }
  }, [append, keys, values]);

  useEffect(() => {
    if (values.length === 0) {
      return noop;
    }
    // In case there are some values — restore them in the form
    values.forEach((_, idx) => append(idx as FieldArray<T, FieldName>));
    return () => {
      values.forEach((_, idx) => remove(idx));
    };
  }, [values, append, remove]);

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
          value={values[index] || keys[index]?.publicKey}
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
