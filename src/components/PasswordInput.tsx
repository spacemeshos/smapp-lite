import { useState } from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form';

import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

type Props = {
  placeholder?: string;
  initialValue?: string;
  register: ReturnType<UseFormRegister<FieldValues>>;
};

function PasswordInput({ placeholder, register }: Props) {
  const [show, setShow] = useState(false);

  const toggleShow = () => setShow(!show);

  return (
    <InputGroup size="md">
      <Input
        pr={2}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        {...register}
      />
      <InputRightElement width={10}>
        <IconButton
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
          icon={show ? <IconEyeOff size={14} /> : <IconEye size={14} />}
          size="sm"
          onClick={toggleShow}
        />
      </InputRightElement>
    </InputGroup>
  );
}

PasswordInput.defaultProps = {
  placeholder: 'Enter password',
  initialValue: '',
};

export default PasswordInput;