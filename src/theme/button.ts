import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const solid = defineStyle({
  bgGradient: 'linear(87.93deg, #3AFFA7 2.84%, #55E8E2 97.16%)',
  textColor: 'brand.darkGreen',
  borderWidth: '2px',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: 'brand.green',
    borderWidth: '2px',
    textColor: 'brand.green',
  },
});

const outline = defineStyle({
  bg: 'brand.darkGreen',
  borderColor: 'brand.green',
  borderWidth: '2px',
  textColor: 'brand.green',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: 'brand.green',
    borderWidth: '2px',
    textColor: 'brand.green',
  },
});

const white = defineStyle({
  bg: '#F0F0F0EE',
  borderColor: '#F0F0F0EE',
  borderWidth: '2px',
  textColor: 'brand.darkGreen',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: '#F0F0F0EE',
    borderWidth: '2px',
    textColor: '#F0F0F0EE',
  },
});

const danger = defineStyle({
  bg: 'red.600',
  borderColor: 'brand.darkGreen',
  borderWidth: '2px',
  textColor: 'brand.lightGray',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: 'red.600',
    borderWidth: '2px',
    textColor: 'red.600',
  },
});

const ghost = defineStyle({
  borderRadius: 'full',
});

const ghostWhite = defineStyle({
  borderRadius: 'full',
  color: '#F0F0F0EE',
});

const buttonTheme = defineStyleConfig({
  defaultProps: {
    colorScheme: 'spacemesh',
  },
  variants: { solid, outline, ghost, ghostWhite, danger, white },
});

export default buttonTheme;
