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
  children,
  inputAddon,
  inputProps,
  value,
}: Props): JSX.Element {
  return (
    <Box mt={2} mb={2}>
      <FormLabel fontSize="sm" mb={0}>
        {label}
      </FormLabel>
      <InputGroup>
        <Input isDisabled {...inputProps} value={value} />
        {inputAddon}
      </InputGroup>
      {children}
    </Box>
  );
}

FormInputViewOnly.defaultProps = {
  inputAddon: null,
  inputProps: {},
};

export default FormInputViewOnly;
