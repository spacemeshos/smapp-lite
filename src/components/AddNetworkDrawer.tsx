import { MutableRefObject } from 'react';
import { Form, useForm } from 'react-hook-form';

import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormLabel,
  Input,
} from '@chakra-ui/react';

import { fetchNetInfo } from '../api/requests/netinfo';
import useNetworks from '../store/useNetworks';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function AddNetworkDrawer({ isOpen, onClose }: Props): JSX.Element {
  const { addNetwork } = useNetworks();
  const { register, setValue, control, handleSubmit } = useForm();

  const onSubmit = handleSubmit((data: Record<string, string>) => {
    addNetwork({
      name: data.name,
      jsonRPC: data.api,
      explorerUrl: data.explorer,
      hrp: data.hrp,
      genesisTime: new Date(data.genesisTime).getSeconds(),
      genesisID: data.genesisID,
    });
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
            <FormLabel>JSON API URL</FormLabel>
            <Input
              {...register('api', {
                required: 'JSON API URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'URL must start with http:// or https://',
                },
                onBlur: async (e) => {
                  const info = await fetchNetInfo(e.target.value);
                  if (!info) return;
                  const isoTime = new Date(info.genesisTime * 1000)
                    .toISOString()
                    .slice(0, 16);
                  setValue('genesisTime', isoTime);
                  setValue('genesisID', info.genesisID);
                },
              })}
            />

            <FormLabel>Name</FormLabel>
            <Input
              {...register('name', {
                minLength: {
                  value: 2,
                  message: 'Give a proper name to the network',
                },
              })}
            />

            <Divider />

            <FormLabel>HRP</FormLabel>
            <Input
              {...register('hrp', {
                required: 'HRP is required',
              })}
            />

            <FormLabel>Genesis Time</FormLabel>
            <Input
              type="datetime-local"
              {...register('genesisTime', {
                required: 'Genesis time is required',
                onChange: (e) => {
                  console.log('changed', e.target.value);
                },
              })}
            />

            <FormLabel>Genesis ID</FormLabel>
            <Input
              {...register('genesisID', {
                required: 'Genesis ID is required',
              })}
            />

            <FormLabel>Explorer URL</FormLabel>
            <Input
              {...register('explorer', {
                required: 'Explorer URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'URL must start with http:// or https://',
                },
              })}
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
