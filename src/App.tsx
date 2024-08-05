import React from 'react';
import { createHashRouter, redirect, RouterProvider } from 'react-router-dom';

import { ChakraProvider, ColorModeScript, Container } from '@chakra-ui/react';

import IdleAlert from './components/IdleAlert';
import CreateMnemonicScreen from './screens/createWallet/CreateMnemonicScreen';
import CreateWalletWrapper from './screens/createWallet/CreateWalletWrapper';
// eslint-disable-next-line max-len
import RecoverMnemonicScreen from './screens/createWallet/RecoverMnemonicScreen';
import SetPasswordScreen from './screens/createWallet/SetPasswordScreen';
import VerifyMnemonicScreen from './screens/createWallet/VerifyMnemonicScreen';
import UnlockScreen from './screens/UnlockScreen';
// eslint-disable-next-line max-len
import WalletScreen from './screens/WalletScreen';
import ImportScreen from './screens/welcome/ImportScreen';
import WelcomeScreen from './screens/welcome/WelcomeScreen';
import WelcomeWrapper from './screens/welcome/WelcomeWrapper';
import useWallet from './store/useWallet';
import theme from './theme';
import Fonts from './theme/Fonts';

function App(): JSX.Element {
  const { hasWallet, isWalletUnlocked } = useWallet();

  const router = createHashRouter([
    {
      path: '/',
      element: <WelcomeWrapper />,
      loader: async () => {
        if (hasWallet()) {
          if (isWalletUnlocked()) {
            throw redirect('/wallet');
          }
          throw redirect('/unlock');
        }
        return null;
      },
      children: [
        {
          index: true,
          element: <WelcomeScreen />,
        },
        {
          path: 'create',
          element: <CreateWalletWrapper />,
          children: [
            {
              index: true,
              element: <CreateMnemonicScreen />,
            },
            {
              path: 'verify-mnemonic',
              element: <VerifyMnemonicScreen />,
            },
            {
              path: 'recover',
              element: <RecoverMnemonicScreen />,
            },
            {
              path: 'set-password',
              element: <SetPasswordScreen />,
            },
          ],
        },
      ],
    },
    {
      path: '/unlock',
      element: <UnlockScreen />,
      loader: async () => {
        if (!hasWallet()) {
          throw redirect('/');
        }
        if (isWalletUnlocked()) {
          throw redirect('/wallet');
        }
        return null;
      },
    },
    {
      path: '/import',
      element: <ImportScreen />,
      loader: async () => {
        if (isWalletUnlocked()) {
          throw redirect('/wallet');
        }
        return null;
      },
    },
    {
      path: '/wallet',
      element: <WalletScreen />,
      loader: async () => {
        if (!isWalletUnlocked()) {
          if (!hasWallet()) {
            throw redirect('/');
          }
          throw redirect('/unlock');
        }
        return null;
      },
    },
  ]);

  return (
    <ChakraProvider theme={theme}>
      <Fonts />
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <IdleAlert />
      <Container
        display="flex"
        flexDirection="column"
        alignItems="center"
        minH="100vh"
        minW="100vw"
        p={4}
      >
        <RouterProvider router={router} />
      </Container>
    </ChakraProvider>
  );
}

export default App;
