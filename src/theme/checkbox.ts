import { checkboxAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(checkboxAnatomy.keys);

const baseStyle = definePartsStyle({
  control: {
    border: '1px',
    padding: 1, // change the padding of the control
    _checked: {
      bg: 'brand.lightGray',
      borderColor: 'brand.darkGreen',
    },
    iconColor: 'brand.green',
    bg: 'brand.lightGray',
    borderColor: 'brand.darkGreen',
  },
});

const checkboxTheme = defineMultiStyleConfig({ baseStyle });
export default checkboxTheme;
