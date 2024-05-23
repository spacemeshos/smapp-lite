import { useCallback, useEffect } from 'react';
import {
  ArrayPath,
  Control,
  FieldArray,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  useFieldArray,
  UseFormRegister,
  UseFormUnregister,
} from 'react-hook-form';

import { Button, IconButton, Text } from '@chakra-ui/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { SafeKey } from '../types/wallet';
import { BUTTON_ICON_SIZE, MAX_MULTISIG_AMOUNT } from '../utils/constants';

import FormKeySelect from './FormKeySelect';

type Props<T extends FieldValues, FieldName extends ArrayPath<T>> = {
  fieldName: FieldName;
  keys: SafeKey[];
  control: Control<T>;
  register: UseFormRegister<T>;
  unregister: UseFormUnregister<T>;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
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
  isSubmitted,
}: Props<T, FieldName>): JSX.Element {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });
  const addEmptyField = useCallback(
    () => append((keys[0]?.publicKey ?? '0x01') as FieldArray<T, FieldName>),
    [append, keys]
  );

  useEffect(() => {
    register('required' as Path<T>, {
      value: fields.length as PathValue<T, Path<T>>,
    });
    return () => unregister('required' as Path<T>);
  }, [register, unregister, fields]);

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
        >
          <IconButton
            icon={<IconTrash size={BUTTON_ICON_SIZE} />}
            isDisabled={index < 2}
            onClick={() => remove(index)}
            aria-label="Remove party"
            ml={2}
          />
        </FormKeySelect>
      ))}
      <Button
        type="button"
        onClick={() => addEmptyField()}
        isDisabled={fields.length >= MAX_MULTISIG_AMOUNT}
      >
        <IconPlus size={BUTTON_ICON_SIZE} />
        <Text as="span" ml={1}>
          Add party
        </Text>
      </Button>
    </>
  );
}

FormMultiKeySelect.defaultProps = {
  isSubmitted: false,
};

export default FormMultiKeySelect;