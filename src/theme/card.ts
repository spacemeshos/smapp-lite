import { cardAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    backgroundColor: 'brand.darkGreen',
    shadow: 'none',
  },
  header: {
    paddingBottom: '2px',
  },
  body: {
    paddingTop: '2px',
  },
  footer: {
    paddingTop: '2px',
  },
});

const sizes = {
  md: definePartsStyle({
    container: {
      borderRadius: '0px',
    },
  }),
};

const cardTheme = defineMultiStyleConfig({ baseStyle, sizes });
export default cardTheme;
