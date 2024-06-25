import { PropsWithChildren, ReactNode, useState } from 'react';
import {
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  UseFormGetValues,
  UseFormRegisterReturn,
  UseFormSetValue,
} from 'react-hook-form';

import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import { IconSwitchHorizontal } from '@tabler/icons-react';

import { CoinUnits, toSMH, toSmidge } from '../utils/smh';

type Props<T extends FieldValues> = PropsWithChildren<{
  label: string;
  register: UseFormRegisterReturn;
  errors: FieldErrors<T>;
  isSubmitted?: boolean;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
}>;

function FormAmountInput<T extends FieldValues>({
  label,
  register,
  errors,
  setValue,
  getValues,
  isSubmitted = false,
}: Props<T>): JSX.Element {
  const [units, setUnits] = useState(CoinUnits.SMH);
  const [displayValue, setDisplayValue] = useState('0');
  const toggleUnits = () => {
    const paths = register.name.split('.');
    const vals = getValues();

    const val = paths.reduce((acc, next) => acc?.[next], vals);
    if (units === CoinUnits.SMH) {
      setDisplayValue(String(val));
      setUnits(CoinUnits.Smidge);
    } else {
      setUnits(CoinUnits.SMH);
      setDisplayValue(toSMH(BigInt(String(val))));
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayValue(val);

    if (units === CoinUnits.SMH) {
      setValue(
        register.name as Path<T>,
        toSmidge(Number(val)) as PathValue<T, Path<T>>
      );
    } else {
      setValue(
        register.name as Path<T>,
        String(BigInt(val)) as PathValue<T, Path<T>>
      );
    }
  };

  const error = errors[register.name];
  return (
    <FormControl
      isRequired={!!register.required}
      isInvalid={isSubmitted && !!errors[register.name]?.message}
      mt={2}
      mb={2}
    >
      <FormLabel fontSize="sm" mb={0}>
        {label}
      </FormLabel>
      <Input type="hidden" {...register} />
      <InputGroup>
        <Input type="number" value={displayValue} onChange={onChange} />
        <InputRightElement p={0} w={100} justifyContent="end" pr={2}>
          <Text fontSize="xs">{units}</Text>
          <IconButton
            aria-label={
              units === CoinUnits.SMH ? 'Switch to Smidge' : 'Switch to SMH'
            }
            size="xs"
            onClick={toggleUnits}
            icon={<IconSwitchHorizontal size={16} />}
            ml={1}
          />
        </InputRightElement>
      </InputGroup>
      {error?.message && (
        <FormErrorMessage>{error.message as ReactNode}</FormErrorMessage>
      )}
    </FormControl>
  );
}

export default FormAmountInput;
