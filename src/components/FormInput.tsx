import { PropsWithChildren, ReactNode } from 'react';
import {
  FieldErrors,
  FieldValues,
  UseFormRegisterReturn,
} from 'react-hook-form';

import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputProps,
  Tooltip,
} from '@chakra-ui/react';
import { IconHelp } from '@tabler/icons-react';

type Props<T extends FieldValues> = PropsWithChildren<{
  label: string;
  register: UseFormRegisterReturn;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  inputAddon?: ReactNode;
  inputProps?: InputProps;
  hint?: ReactNode;
}>;

function FormInput<T extends FieldValues>({
  label,
  register,
  errors,
  isSubmitted = false,
  children = '',
  inputAddon = null,
  inputProps = {},
  hint = undefined,
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
        {!!hint && (
          <Tooltip label={hint}>
            <Box display="inline-block" ml={1}>
              <IconHelp size={14} style={{ marginBottom: '-2px' }} />
            </Box>
          </Tooltip>
        )}
      </FormLabel>
      <InputGroup>
        <Input {...inputProps} {...register} />
        {inputAddon}
      </InputGroup>
      {children}
      {error?.message && (
        <FormErrorMessage textColor="brand.red">
          {error.message as ReactNode}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}

export default FormInput;
