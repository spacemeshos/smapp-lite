import React from 'react';
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';

import IdleAlert from './components/IdleAlert';
import WalletScreen from './screens/WalletScreen';
import CreateWalletScreen from './screens/welcome/CreateWalletScreen';
import WelcomeScreen from './screens/welcome/WelcomeScreen';
import WelcomeWrapper from './screens/welcome/Wrapper';
import useWallet from './store/useWallet';
import theme from './theme';

function App(): JSX.Element {
  const { hasWallet, isWalletUnlocked } = useWallet();

  const router = createBrowserRouter([
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
          path: '/',
          element: <WelcomeScreen />,
        },
        {
          path: 'create',
          element: <CreateWalletScreen />,
        },
      ],
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
      <IdleAlert />
      <RouterProvider router={router} />
    </ChakraProvider>
  );
}

export default App;
