import { Text, TextProps } from '@chakra-ui/react';

export default function GreenHeader({
  children,
  textProps = {},
}: React.PropsWithChildren<{ textProps?: TextProps }>): JSX.Element {
  return (
    <Text
      color="brand.green"
      mb={4}
      textAlign="center"
      fontSize={{ base: '24px', md: '30px' }}
      fontFamily="Univers63"
      {...textProps}
    >
      {children}
    </Text>
  );
}
