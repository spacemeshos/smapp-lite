import { PropsWithChildren, ReactNode } from 'react';
import {
  FieldErrors,
  FieldValues,
  UseFormRegisterReturn,
} from 'react-hook-form';

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputGroup,
  Select,
  SelectProps,
} from '@chakra-ui/react';

type Props<T extends FieldValues> = PropsWithChildren<{
  label?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  register: UseFormRegisterReturn;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  inputProps?: SelectProps;
}>;

function FormSelect<T extends FieldValues>({
  label,
  options,
  register,
  errors,
  isSubmitted,
  children,
  inputProps,
}: Props<T>): JSX.Element {
  const isRequired = !!register.required;
  const error = errors[register.name];
  return (
    <FormControl
      isRequired={isRequired}
      isInvalid={isSubmitted && !!errors[register.name]?.message}
      mt={2}
      mb={2}
    >
      {label && (
        <FormLabel fontSize="sm" mb={0}>
          {label}
        </FormLabel>
      )}
      <InputGroup>
        <Select {...inputProps} {...register}>
          {options.map(({ value, label: optLabel, disabled }) => (
            <option key={value} value={value} disabled={!!disabled}>
              {optLabel}
            </option>
          ))}
        </Select>
      </InputGroup>
      {children}
      {error?.message && (
        <FormErrorMessage>{error.message as ReactNode}</FormErrorMessage>
      )}
    </FormControl>
  );
}

FormSelect.defaultProps = {
  label: '',
  isSubmitted: false,
  inputProps: {},
};

export default FormSelect;
