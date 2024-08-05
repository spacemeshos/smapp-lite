import { selectAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(selectAnatomy.keys);

const outline = definePartsStyle({
  field: {
    borderRadius: 'full',
    borderColor: 'blackAlpha.800',
  },
});

const selectTheme = defineMultiStyleConfig({
  variants: { outline },
});

export default selectTheme;
