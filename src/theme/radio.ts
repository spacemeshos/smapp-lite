import { radioAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(radioAnatomy.keys);

const variants = {
  greenDot: definePartsStyle({
    control: {
      borderRadius: 'full',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'spacemesh.500',
      background: 'brand.lightGray',

      _checked: {
        borderColor: 'spacemesh.500',
        background: 'brand.lightGray',
        color: 'spacemesh.700',

        _focus: {
          borderColor: 'spacemesh.500',
          background: 'brand.lightGray',
          boxShadow: 'none',
        },

        _hover: {
          borderColor: 'spacemesh.500',
          background: 'brand.lightGray',
        },
      },
      _focus: {
        borderColor: 'spacemesh.500',
        background: 'brand.lightGray',
        boxShadow: 'none',
      },
    },
  }),
};

const radioTheme = defineMultiStyleConfig({ variants });
export default radioTheme;
