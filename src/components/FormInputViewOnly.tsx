import { PropsWithChildren, ReactNode } from 'react';

import {
  Box,
  FormLabel,
  Input,
  InputGroup,
  InputProps,
} from '@chakra-ui/react';

type Props = PropsWithChildren<{
  label: string;
  inputAddon?: ReactNode;
  inputProps?: InputProps;
  value: string;
}>;

function FormInputViewOnly({
  label,
  children = '',
  inputAddon = null,
  inputProps = {},
  value,
}: Props): JSX.Element {
  return (
    <Box mt={2} mb={2}>
      <FormLabel fontSize="sm" mb={0} textAlign="center">
        {label}
      </FormLabel>
      <InputGroup>
        <Input
          isDisabled
          {...inputProps}
          value={value}
          fontSize="sm"
          borderRadius="full"
        />
        {inputAddon}
      </InputGroup>
      {children}
    </Box>
  );
}

export default FormInputViewOnly;
