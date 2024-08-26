import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const darkPill = definePartsStyle({
  field: {
    border: '1px solid',
    borderColor: 'brand.lightGray',
    background: 'brand.darkGreen',
    borderRadius: 'full',
    _hover: {
      borderColor: 'brand.green',
    },
    _focus: {
      borderColor: 'brand.green',
      boxShadow: '0 0 0 1px brand.green',
    },
  },
});

const whitePill = definePartsStyle({
  field: {
    border: '1px solid',
    borderColor: 'spacemesh.900',
    background: 'brand.lightGray',
    borderRadius: 'full',
    textColor: 'black',
    paddingLeft: 4,
    paddingRight: 4,
    _focus: {
      borderColor: 'spacemesh.400',
    },
  },
});

const inputTheme = defineMultiStyleConfig({
  variants: { darkPill, whitePill },
});

export default inputTheme;
