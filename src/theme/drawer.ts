import { drawerAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  // define the part you're going to style
  overlay: {
    bg: 'blackAlpha.300',
  },
  dialog: {
    borderRadius: 'md',
    bg: `brand.darkGreen`,
  },
});

const drawerTheme = defineMultiStyleConfig({
  baseStyle,
});

export default drawerTheme;
