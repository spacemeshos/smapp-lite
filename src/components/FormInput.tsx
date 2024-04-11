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
  Input,
  InputGroup,
  InputProps,
} from '@chakra-ui/react';

type Props<T extends FieldValues> = PropsWithChildren<{
  label: string;
  register: UseFormRegisterReturn;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  inputAddon?: ReactNode;
  inputProps?: InputProps;
}>;

function FormInput<T extends FieldValues>({
  label,
  register,
  errors,
  isSubmitted,
  children,
  inputAddon,
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
      <FormLabel fontSize="sm" mb={0}>
        {label}
      </FormLabel>
      <InputGroup>
        <Input {...inputProps} {...register} />
        {inputAddon}
      </InputGroup>
      {children}
      {error?.message && (
        <FormErrorMessage>{error.message as ReactNode}</FormErrorMessage>
      )}
    </FormControl>
  );
}

FormInput.defaultProps = {
  isSubmitted: false,
  inputAddon: null,
  inputProps: {},
};

export default FormInput;
