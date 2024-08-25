import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  overlay: {
    bg: 'blackAlpha.600',
  },
  dialog: {
    color: 'black',
    paddingX: [2, 12],
    paddingY: [2, 16],
    borderRadius: '2xl',
    bg: `brand.lightGray`,
  },
});

const modalTheme = defineMultiStyleConfig({
  baseStyle,
});

export default modalTheme;
