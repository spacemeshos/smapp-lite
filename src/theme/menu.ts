import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  button: {
    fontWeight: 'medium',
    bg: 'teal.500',
    color: 'gray.200',
    _hover: {
      bg: 'alpha.50',
      color: 'white',
    },
  },
  list: {
    py: '4',
    borderRadius: 'xl',
    border: 'none',
    bg: 'brand.lightGray',
  },
  item: {
    color: 'brand.darkGreen',
    bg: 'brand.lightGray',
    _focus: {
      bg: 'blackAlpha.100',
    },
  },
  groupTitle: {
    textTransform: 'uppercase',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 'wider',
    opacity: '0.7',
  },
  command: {
    opacity: '0.8',
    fontFamily: 'mono',
    fontSize: 'sm',
    letterSpacing: 'tighter',
    pl: '4',
  },
  divider: {
    my: '4',
    mx: '2',
    color: 'brand.darkGreen',
    borderBottom: '2px ',
  },
});

const menuTheme = defineMultiStyleConfig({ baseStyle });

export default menuTheme;
