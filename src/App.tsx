import React from 'react';
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';

import WalletScreen from './screens/WalletScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import useWallet from './store/useWallet';
import theme from './theme';

function App(): JSX.Element {
  const { hasWallet, isWalletUnlocked } = useWallet();

  const router = createBrowserRouter([
    {
      path: '/',
      element: <WelcomeScreen />,
      loader: async () => {
        if (hasWallet()) {
          if (isWalletUnlocked()) {
            throw redirect('/wallet');
          }
          throw redirect('/unlock');
        }
        return null;
      },
    },
    {
      path: '/unlock',
      element: <div>UNLOCK</div>,
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
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <RouterProvider router={router} />
    </ChakraProvider>
  );
}

export default App;
