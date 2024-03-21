import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';

import SplashScreen from './screens/SplashScreen';
import theme from './theme';

function App(): JSX.Element {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          {/* Добавьте дополнительные маршруты здесь */}
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
