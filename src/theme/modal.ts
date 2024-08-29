import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  overlay: {
    bg: 'blackAlpha.600',
  },
  dialog: {
    color: 'brand.lightGray',
    paddingX: [2, 6],
    paddingTop: [6, 8],
    paddingBottom: [4, 6],
    marginX: 2,
    borderRadius: '2xl',
    bg: `brand.modalGreen`,
    maxH: '90vh',
    overflowY: 'auto',
  },
});

const modalTheme = defineMultiStyleConfig({
  baseStyle,
});

export default modalTheme;
