import { defineStyleConfig } from '@chakra-ui/react';

const tooltipTheme = defineStyleConfig({
  baseStyle: {
    borderRadius: 'md',
    fontWeight: 'normal',
    bg: 'brand.lightGray',
    textColor: 'brand.darkGreen',
  },
});

export default tooltipTheme;
