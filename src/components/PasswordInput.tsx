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
  register: ReturnType<UseFormRegister<FieldValues>>;
};

function PasswordInput({ placeholder = 'Enter password', register }: Props) {
  const [show, setShow] = useState(false);

  const toggleShow = () => setShow(!show);

  return (
    <InputGroup size="md" width={['100%', 350]}>
      <Input
        pr={2}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        {...register}
        borderRadius="full"
        borderColor="brand.darkGreen"
      />
      <InputRightElement width={10}>
        <IconButton
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
          icon={show ? <IconEyeOff size={14} /> : <IconEye size={14} />}
          size="sm"
          onClick={toggleShow}
          variant="ghost"
        />
      </InputRightElement>
    </InputGroup>
  );
}

export default PasswordInput;
