import { useEffect, useRef, useState } from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormUnregister,
} from 'react-hook-form';

import { Button, FormControl, FormLabel, Input } from '@chakra-ui/react';

import { toHexString } from '../../utils/hexString';
import PreviewDataRow from '../PreviewDataRow';

import { FormValues } from './schemas';

type DeployProps = {
  register: UseFormRegister<FormValues>;
  unregister: UseFormUnregister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
};

function Deploy({ register, unregister, setValue }: DeployProps): JSX.Element {
  const [program, setProgram] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    register('payload.program');
    return () => {
      unregister('payload.program');
    };
  }, [unregister, register]);

  useEffect(() => {
    if (program) {
      setValue('payload.program', program);
    }
  }, [program, setValue, unregister]);

  return (
    <FormControl isRequired>
      <FormLabel fontSize="sm" mb={1}>
        Choose the compiled program to deploy a template:
      </FormLabel>
      <Button
        w="100%"
        variant="whiteModal"
        onClick={() => {
          if (fileRef.current) {
            fileRef.current.click();
          }
        }}
      >
        Select .ELF file
      </Button>
      <Input
        ref={fileRef}
        type="file"
        accept=".elf"
        multiple={false}
        display="none"
        onChange={(evt) => {
          if (evt.target.files?.[0]) {
            const file = evt.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
              if (!reader.result) return;
              const content =
                typeof reader.result === 'string'
                  ? reader.result
                  : toHexString(reader.result);
              setProgram(content);
              // To allow load the same program again:
              // eslint-disable-next-line no-param-reassign
              evt.target.value = '';
            };
            reader.readAsArrayBuffer(file);
          }
        }}
      />
      <PreviewDataRow
        label="Program bytecode"
        value={program}
        boxProps={{
          my: 2,
          display: program ? 'block' : 'none',
        }}
        valueProps={{
          as: 'pre',
          fontSize: 'xx-small',
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
          maxH: '100px',
          overflowY: 'auto',
        }}
      />
    </FormControl>
  );
}

export default Deploy;
