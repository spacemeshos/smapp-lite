import EventEmitter from 'eventemitter3';
import { useState } from 'react';
import {
  Control,
  FieldErrors,
  useForm,
  UseFormRegisterReturn,
} from 'react-hook-form';
import { singletonHook } from 'react-singleton-hook';
import { create } from 'zustand';

import { useDisclosure } from '@chakra-ui/react';

import { MINUTE } from '../utils/constants';
import { noop } from '../utils/func';

const REMEMBER_PASSWORD_TIME = 5 * MINUTE;

export interface PasswordState {
  password: string | null;
  timeout: ReturnType<typeof setTimeout> | null;
  setPassword: (password: string, remember: boolean) => void;
  resetPassword: () => void;
}

const usePasswordStore = create<PasswordState>((set, get) => ({
  password: null,
  timeout: null,
  setPassword: (password, remember) => {
    const state = get();
    if (state.timeout) {
      clearTimeout(state.timeout);
    }
    if (remember) {
      set({
        password,
        timeout: remember
          ? setTimeout(() => {
              set({
                password: null,
                timeout: null,
              });
            }, REMEMBER_PASSWORD_TIME)
          : null,
      });
    }
  },
  resetPassword: () => {
    const state = get();
    if (state.timeout) {
      clearTimeout(state.timeout);
    }

    set({
      password: null,
      timeout: null,
    });
  },
}));

type PasswordCallback<T = unknown> = (password: string) => Promise<T>;

type PasswordFormValues = {
  password: string;
  remember: boolean;
};

const eventEmitter = new EventEmitter();

type UsePasswordReturnType = {
  withPassword: <T>(
    callback: PasswordCallback<T>,
    actionLabel?: string,
    info?: JSX.Element | string | null
  ) => Promise<T | null>;
  resetPassword: () => void;
  form: {
    control: Control<PasswordFormValues>;
    additionalInfo: JSX.Element | string | null;
    actionLabel: string;
    errors: FieldErrors<PasswordFormValues>;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    register: {
      password: UseFormRegisterReturn<'password'> | null;
      remember: UseFormRegisterReturn<'remember'> | null;
    };
  };
};

const usePassword = (): UsePasswordReturnType => {
  const {
    control,
    formState: { errors },
    reset,
    setError,
    setValue,
    register,
    handleSubmit,
  } = useForm<PasswordFormValues>();
  const { isOpen, onOpen, onClose: _onClose } = useDisclosure();
  const {
    password: _password,
    setPassword,
    resetPassword,
  } = usePasswordStore();
  const [additionalInfo, setAdditionalInfo] = useState<
    JSX.Element | string | null
  >(null);
  const [_actionLabel, setActionLabel] = useState<string>('Proceed');
  const [passwordCallback, setPasswordCallback] =
    useState<PasswordCallback | null>(null);

  // Handlers for Alert Form
  const onSubmit = handleSubmit(async ({ password, remember }) => {
    if (!passwordCallback) {
      setError(
        'root',
        new Error(
          'Password callback is not set. Please close the Alert and try again.'
        )
      );
      return;
    }
    try {
      const res = await passwordCallback(password);
      setPassword(password, remember);
      _onClose();
      setValue('password', '');
      reset();
      eventEmitter.emit('success', res);
    } catch (err) {
      setError('password', { message: 'Incorrect password' });
    }
  });

  const onClose = () => {
    eventEmitter.emit('close', true);
    reset();
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

  const openAlert = async <T>(
    callback: PasswordCallback<T>,
    actionLabel: string,
    info: JSX.Element | string | null
  ): Promise<T | null> => {
    setPasswordCallback(() => callback);
    setActionLabel(actionLabel);
    setAdditionalInfo(info);
    onOpen();
    return waitForIt<T>();
  };

  // Call action that requires password wrapped with this function
  const withPassword = async <T>(
    callback: PasswordCallback<T>,
    actionLabel = 'Proceed',
    info: JSX.Element | string | null = null
  ) => {
    let result: T | null = null;
    if (_password) {
      try {
        result = await callback(_password);
      } catch (err) {
        result = await openAlert(callback, actionLabel, info);
      }
    }
    if (!_password) {
      result = await openAlert(callback, actionLabel, info);
    }
    _onClose();
    return result;
  };

  return {
    withPassword,
    resetPassword,
    form: {
      control,
      additionalInfo,
      actionLabel: _actionLabel,
      errors,
      isOpen,
      onClose,
      onSubmit,
      register: {
        password: register('password'),
        remember: register('remember'),
      },
    },
  };
};

export default singletonHook(
  {
    withPassword: () => Promise.resolve(null),
    resetPassword: noop,
    form: {
      control: {} as Control<PasswordFormValues>,
      additionalInfo: null,
      actionLabel: 'Proceed',
      errors: {},
      isOpen: false,
      onClose: noop,
      onSubmit: () => Promise.resolve(),
      register: {
        password: null,
        remember: null,
      },
    },
  },
  usePassword
);
