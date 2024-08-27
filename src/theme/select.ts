import { selectAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(selectAnatomy.keys);

const whitePill = definePartsStyle({
  field: {
    color: 'black',
    border: '1px solid',
    borderColor: 'spacemesh.900',
    background: 'brand.lightGray',
    borderRadius: 'full',
    paddingLeft: 4,
    paddingRight: 4,
    _focus: {
      borderColor: 'spacemesh.400',
    },
  },
});

const selectTheme = defineMultiStyleConfig({
  variants: { whitePill },
});

export default selectTheme;
