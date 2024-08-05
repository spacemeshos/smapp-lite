import { extendTheme, StyleFunctionProps, ThemeConfig } from '@chakra-ui/react';
import buttonTheme from './theme/button';
import cardTheme from './theme/card';
import checkboxTheme from './theme/checkbox';
import drawerTheme from './theme/drawer';
import menuTheme from './theme/menu';
import modalTheme from './theme/modal';
import radioTheme from './theme/radio';
import tabsTheme from './theme/tabs';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  spacemesh: {
    50: '#3AFFA7',
    100: '#34E596',
    200: '#2ECB86',
    300: '#28B175',
    400: '#229764',
    500: '#1C7D54',
    600: '#166343',
    700: '#104933',
    800: '#0A2F22',
    850: '#091F19',
    900: '#061A14',
  },
  brand: {
    darkGreen: '#061A14',
    green: '#3AFFA7',
    lightGreen: '#F6FFEC',
    lightGray: '#F0F0F0',
  },
};

const styles = {
  global: {
    body: {
      bg: 'brand.darkGreen',
    },
  },
};

const components = {
  Menu: menuTheme,
  Button: buttonTheme,
  Card: cardTheme,
  Tabs: tabsTheme,
  Modal: modalTheme,
  Drawer: drawerTheme,
  Checkbox: checkboxTheme,
  Radio: radioTheme,
};
const theme = extendTheme({ config, colors, components, styles });

export default theme;
