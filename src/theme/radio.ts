import { radioAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(radioAnatomy.keys);

const baseStyle = definePartsStyle({
  // define the part you're going to style
  control: {
    borderRadius: '15px', // change the border radius
    borderColor: 'brand.darkGreen', // change the border color
    _checked: {
      bg: 'white',
      borderColor: 'brand.darkGreen',
    },
  },
});

const radioTheme = defineMultiStyleConfig({ baseStyle });
export default radioTheme;
