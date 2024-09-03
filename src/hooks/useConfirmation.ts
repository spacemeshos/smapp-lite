import EventEmitter from 'eventemitter3';
import { useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { useDisclosure } from '@chakra-ui/react';

import { noop } from '../utils/func';
import { postpone } from '../utils/promises';

const eventEmitter = new EventEmitter();

type Callback<T = unknown> = () => T | Promise<T>;
type UseConfirmationReturnType = {
  withConfirmation: <T>(
    callback: Callback<T>,
    actionLabel: string,
    header: JSX.Element | string | null,
    content: JSX.Element | string | null
  ) => Promise<T | null>;
  disclosure: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    header: JSX.Element | string | null;
    content: JSX.Element | string | null;
    actionLabel: string;
  };
};

const usePassword = (): UseConfirmationReturnType => {
  const { isOpen, onOpen, onClose: _onClose } = useDisclosure();
  const [header, setHeader] = useState<JSX.Element | string | null>(null);
  const [content, setContent] = useState<JSX.Element | string | null>(null);
  const [actionLabel, setActionLabel] = useState<string>('Proceed');
  const [callback, setCallback] = useState<Callback | null>(null);

  // Handlers for Alert Form
  const onSubmit = async () =>
    postpone(async () => {
      if (!callback) {
        throw new Error(
          // eslint-disable-next-line max-len
          'Callback for confirmation alert is not set. Please close the Alert and try again.'
        );
      }

      const res = await callback();
      _onClose();
      eventEmitter.emit('success', res);
    }, 1);

  const onClose = () => {
    eventEmitter.emit('close', true);
    _onClose();
  };

  // Utils
  const waitForIt = <T>() =>
    new Promise<T | null>((resolve) => {
      eventEmitter.once('close', () => {
        eventEmitter.removeAllListeners();
        resolve(null);
      });
      eventEmitter.once('success', (x: T) => {
        eventEmitter.removeAllListeners();
        resolve(x);
      });
    });

  const withConfirmation = async <T>(
    cb: Callback<T>,
    _actionLabel: string,
    _header: JSX.Element | string | null,
    _content: JSX.Element | string | null
  ): Promise<T | null> => {
    setCallback(() => cb);
    setActionLabel(_actionLabel);
    setHeader(_header);
    setContent(_content);
    onOpen();
    return waitForIt<T>();
  };

  return {
    withConfirmation,
    disclosure: {
      isOpen,
      onClose,
      onSubmit,
      header,
      content,
      actionLabel,
    },
  };
};

export default singletonHook(
  {
    withConfirmation: Promise.resolve,
    disclosure: {
      isOpen: false,
      onClose: noop,
      onSubmit: Promise.resolve,
      header: null,
      content: null,
      actionLabel: 'Proceed',
    },
  },
  usePassword
);
