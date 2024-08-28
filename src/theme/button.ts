import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const green = defineStyle({
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

const ghostGreen = defineStyle({
  textColor: 'brand.green',
  fillColor: 'brand.green',
  bgColor: 'brand.darkGreen',
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

const ghostWhite = defineStyle({
  borderRadius: 'full',
  color: '#F0F0F0EE',
  cursor: 'pointer',
  _hover: {
    color: 'brand.green',
  },
});

const whiteModal = defineStyle({
  bg: '#F0F0F0EE',
  borderColor: '#F0F0F0EE',
  borderWidth: '2px',
  textColor: 'brand.modalGreen',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.modalGreen',
    borderColor: '#F0F0F0EE',
    borderWidth: '2px',
    textColor: '#F0F0F0EE',
  },
});

const whiteOutline = defineStyle({
  bg: 'brand.darkGreen',
  borderColor: '#F0F0F0EE',
  borderWidth: '2px',
  textColor: '#F0F0F0EE',
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
  borderColor: 'red.600',
  borderWidth: '2px',
  textColor: 'brand.lightGray',
  borderRadius: 'full',
  _hover: {
    bg: 'red.500',
    borderColor: 'red.500',
    borderWidth: '2px',
    textColor: 'brand.lightGray',
  },
});

const dark = defineStyle({
  textColor: 'brand.lightGray',
  fillColor: 'brand.lightGray',
  bgColor: 'brand.darkGreen',
  borderRadius: 'full',
  _hover: {
    textColor: 'brand.green',
    fillColor: 'brand.green',
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

const ghost = defineStyle({
  borderRadius: 'full',
});

const ghostGray = defineStyle({
  borderRadius: 'full',
  color: '#7D7B7B',
});

const buttonTheme = defineStyleConfig({
  defaultProps: {
    colorScheme: 'spacemesh',
  },
  variants: {
    green,
    ghostGreen,
    white,
    ghostWhite,
    whiteModal,
    whiteOutline,
    danger,
    outline,
  },
});

export default buttonTheme;
