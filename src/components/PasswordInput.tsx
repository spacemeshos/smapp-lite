import { useState } from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form';

import {
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
} from '@chakra-ui/react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

type Props = {
  placeholder?: string;
  register: ReturnType<UseFormRegister<FieldValues>>;
  inputProps?: InputProps;
};

function PasswordInput({
  placeholder = 'Enter password',
  register,
  inputProps = {},
}: Props) {
  const [show, setShow] = useState(false);

  const toggleShow = () => setShow(!show);

  return (
    <InputGroup size="md" w={['100%']}>
      <Input
        pr={2}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        {...register}
        fontSize="small"
        variant="darkPill"
        _placeholder={{ color: 'brand.darkGray' }}
        {...inputProps}
      />
      <InputRightElement width={10} borderRadius="full">
        <IconButton
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
          icon={show ? <IconEyeOff size={14} /> : <IconEye size={14} />}
          size="sm"
          onClick={toggleShow}
          variant="ghostWhite"
        />
      </InputRightElement>
    </InputGroup>
  );
}

export default PasswordInput;
