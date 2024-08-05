import { tabsAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

// define the base component styles
const baseStyle = definePartsStyle({
  // define the part you're going to style
  tab: {
    fontWeight: 'semibold', // change the font weight
    _selected: {
      color: 'brand.green',
    },
  },
  tablist: {
    borderBottom: '2x solid',
    borderColor: 'inherit',
  },
});

// export the component theme
const tabsTheme = defineMultiStyleConfig({ baseStyle });
export default tabsTheme;
