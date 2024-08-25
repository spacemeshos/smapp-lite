import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  UseFormGetValues,
  UseFormRegisterReturn,
  UseFormSetValue,
  UseFormWatch,
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
  watch: UseFormWatch<T>;
}>;

function FormAmountInput<T extends FieldValues>({
  label,
  register,
  errors,
  setValue,
  getValues,
  watch,
  isSubmitted = false,
}: Props<T>): JSX.Element {
  const [units, setUnits] = useState(CoinUnits.SMH);
  const [displayValue, setDisplayValue] = useState('0');
  const formVal = watch(register.name as Path<T>);

  useEffect(() => {
    // Do not re-update in case it is the same value
    const curSmidges =
      units === CoinUnits.SMH ? toSmidge(Number(displayValue)) : displayValue;
    if (!formVal || formVal === curSmidges) {
      return;
    }

    if (units === CoinUnits.SMH) {
      // Update display value and change units if needed
      if (formVal > 10n ** 7n) {
        setDisplayValue(toSMH(BigInt(formVal)));
      } else {
        setDisplayValue(formVal);
        setUnits(CoinUnits.Smidge);
      }
    }
    if (units === CoinUnits.Smidge) {
      // Update display value and change units if needed
      if (formVal > 10n ** 7n) {
        setDisplayValue(toSMH(BigInt(formVal)));
        setUnits(CoinUnits.SMH);
      } else {
        setDisplayValue(formVal);
      }
    }
  }, [displayValue, formVal, units]);

  const paths = register.name.split('.');
  const error = paths.reduce(
    (acc, next) =>
      Object.hasOwn(acc, next) ? (acc[next] as FieldErrors<T>) : acc,
    errors
  ) as FieldError | undefined;

  // Handlers
  const toggleUnits = () => {
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
      if ((!val && val !== '0') || Number.isNaN(Number(val))) {
        // Required to invalidate values like `123-1231231`
        setValue(register.name as Path<T>, val as PathValue<T, Path<T>>);
        return;
      }
      setValue(
        register.name as Path<T>,
        toSmidge(Number(val)) as PathValue<T, Path<T>>
      );
    } else {
      setValue(register.name as Path<T>, val as PathValue<T, Path<T>>);
    }
  };

  // Component
  return (
    <FormControl
      isRequired={!!register.required}
      isInvalid={isSubmitted && !!error?.message}
      mt={2}
      mb={2}
    >
      <FormLabel fontSize="sm" mb={0}>
        {label}
      </FormLabel>
      <Input type="hidden" {...register} />
      <InputGroup>
        <Input
          variant="whitePill"
          type="number"
          key={`display_input-${register.name}`}
          value={displayValue}
          onChange={onChange}
        />
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
            variant="outlineWhite"
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
