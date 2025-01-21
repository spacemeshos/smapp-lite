import { useMemo, useState } from 'react';
import { Form, useForm } from 'react-hook-form';

import {
  Button,
  Checkbox,
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
  Text,
} from '@chakra-ui/react';

import { fetchNetworkInfo } from '../api/requests/netinfo';
import useNetworks from '../store/useNetworks';
import { toISO, toMs } from '../utils/datetime';
import { normalizeURL } from '../utils/url';

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
  layerDuration: string;
  layersPerEpoch: string;
  isAthena: boolean;
};

function AddNetworkDrawer({ isOpen, onClose }: Props): JSX.Element {
  const { addNetwork } = useNetworks();
  const {
    register,
    setValue,
    reset,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>();
  const genesisTimeValue = watch('genesisTime');
  const genesisTimeMs = useMemo(
    () => toMs(genesisTimeValue),
    [genesisTimeValue]
  );

  const [apiError, setApiError] = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit((data) => {
    addNetwork({
      name: data.name,
      jsonRPC: data.api,
      explorerUrl: data.explorer,
      hrp: data.hrp,
      genesisID: data.genesisID,
      genesisTime: toMs(data.genesisTime),
      layerDuration: parseInt(data.layerDuration, 10),
      layersPerEpoch: parseInt(data.layersPerEpoch, 10),
      isAthena: data.isAthena ?? false,
    });

    close();
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
              label="JSON API URL"
              register={register('api', {
                value: 'https://',
                required: 'JSON API URL is required',
                setValueAs: normalizeURL,
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'URL must start with http:// or https://',
                },
                onBlur: async (e) => {
                  setApiError('');
                  setApiLoading(true);
                  try {
                    const info = await fetchNetworkInfo(
                      normalizeURL(e.target.value)
                    );
                    if (!info) {
                      throw new Error('Cannot fetch network info');
                    }
                    const isoTime = toISO(info.genesisTime);
                    setValue('genesisTime', isoTime);
                    setValue('hrp', info.hrp);
                    setValue('genesisID', info.genesisId);
                    setValue('layerDuration', String(info.layerDuration));
                    setValue('layersPerEpoch', String(info.layersPerEpoch));
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
                <FormHelperText textColor="brand.red">
                  {apiError}
                </FormHelperText>
              )}
            </FormInput>
            <FormInput
              label="Explorer URL"
              register={register('explorer', {
                required: 'Explorer URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'URL must start with http:// or https://',
                },
                value: 'https://explorer.spacemesh.io',
                setValueAs: normalizeURL,
              })}
              errors={errors}
              isSubmitted={isSubmitted}
            />

            <Text
              fontSize="x-small"
              color="brand.gray"
              mt={6}
              textAlign="center"
            >
              Next fields should be filled automatically by the API.
            </Text>

            <FormInput
              label="HRP"
              register={register('hrp', {
                required: 'HRP is required',
              })}
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
              label="Genesis Time"
              register={register('genesisTime', {
                required: 'Genesis time is required',
              })}
              inputProps={{ type: 'datetime-local' }}
              errors={errors}
              isSubmitted={isSubmitted}
            >
              <Text fontSize="xx-small" px={4} mt={0.5}>
                UNIX Time: {Number.isNaN(genesisTimeMs) ? '???' : genesisTimeMs}
              </Text>
            </FormInput>
            <FormInput
              label="Layer Duration (sec)"
              register={register('layerDuration', {
                required: 'Layer duration is required',
              })}
              inputProps={{ type: 'number' }}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <FormInput
              label="Layers per Epoch"
              register={register('layersPerEpoch', {
                required: 'Layers per epoch is required',
              })}
              inputProps={{ type: 'number' }}
              errors={errors}
              isSubmitted={isSubmitted}
            />
            <Checkbox
              size="lg"
              mt={2}
              pl={4}
              {...register('isAthena', { value: false })}
            >
              <Text fontSize="md">Running under Athena VM</Text>
            </Checkbox>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="whiteModal" mr={3} onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="whiteModal" onClick={onSubmit}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Form>
    </Drawer>
  );
}

export default AddNetworkDrawer;
