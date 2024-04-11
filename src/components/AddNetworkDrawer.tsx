import { useState } from 'react';
import { Form, useForm } from 'react-hook-form';

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormHelperText,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';

import { fetchNetInfo } from '../api/requests/netinfo';
import useNetworks from '../store/useNetworks';

import FormInput from './FormInput';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type FormValues = {
  api: string;
  name: string;
  hrp: string;
  genesisTime: string;
  genesisID: string;
  explorer: string;
};

function AddNetworkDrawer({ isOpen, onClose }: Props): JSX.Element {
  const { addNetwork } = useNetworks();
  const {
    register,
    setValue,
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>();

  const [apiError, setApiError] = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  const onSubmit = handleSubmit((data: Record<string, string>) => {
    addNetwork({
      name: data.name,
      jsonRPC: data.api,
      explorerUrl: data.explorer,
      hrp: data.hrp,
      genesisTime: new Date(data.genesisTime).getSeconds(),
      genesisID: data.genesisID,
    });

    reset();
    onClose();
  });

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <Form control={control}>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create new network</DrawerHeader>

          <DrawerBody>
            <FormInput
              label="JSON API URL"
              register={register('api', {
                required: 'JSON API URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'URL must start with http:// or https://',
                },
                onBlur: async (e) => {
                  setApiError('');
                  setApiLoading(true);
                  try {
                    const info = await fetchNetInfo(e.target.value);
                    if (!info) {
                      throw new Error('Cannot fetch network info');
                    }
                    const isoTime = new Date(info.genesisTime * 1000)
                      .toISOString()
                      .slice(0, 16);
                    setValue('genesisTime', isoTime);
                    setValue('genesisID', info.genesisID);
                  } catch (err) {
                    if (err instanceof Error) {
                      setApiError(err.message);
                    }
                  }
                  setApiLoading(false);
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
              inputAddon={
                apiLoading ? (
                  <InputRightElement p={0}>
                    <Spinner size="sm" color="gray.500" />
                  </InputRightElement>
                ) : null
              }
            >
              {!!apiError && (
                <FormHelperText color="red">{apiError}</FormHelperText>
              )}
            </FormInput>

            <FormInput
              label="Name"
              register={register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Give a proper name to the network',
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />

            <FormInput
              label="HRP"
              register={register('hrp', {
                required: 'HRP is required',
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />

            <FormInput
              label="Genesis Time"
              register={register('genesisTime', {
                required: 'Genesis time is required',
              })}
              inputProps={{ type: 'datetime-local' }}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Genesis ID"
              register={register('genesisID', {
                required: 'Genesis ID is required',
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />

            <FormInput
              label="Explorer URL"
              register={register('explorer', {
                required: 'Explorer URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'URL must start with http:// or https://',
                },
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="green" onClick={onSubmit}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Form>
    </Drawer>
  );
}

export default AddNetworkDrawer;
