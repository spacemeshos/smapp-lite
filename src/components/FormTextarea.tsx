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
  Textarea,
  TextareaProps,
} from '@chakra-ui/react';

type Props<T extends FieldValues> = PropsWithChildren<{
  label: string;
  register: UseFormRegisterReturn;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  textareaProps?: TextareaProps;
}>;

function FormTextarea<T extends FieldValues>({
  label,
  register,
  errors,
  isSubmitted,
  children,
  textareaProps,
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
      <FormLabel fontSize="sm" mb={0}>
        {label}
      </FormLabel>
      <Textarea {...textareaProps} {...register} />
      {children}
      {error?.message && (
        <FormErrorMessage>{error.message as ReactNode}</FormErrorMessage>
      )}
    </FormControl>
  );
}

FormTextarea.defaultProps = {
  isSubmitted: false,
  textareaProps: { rows: 4 },
};

export default FormTextarea;
