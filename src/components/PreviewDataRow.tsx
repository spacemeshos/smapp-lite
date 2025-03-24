import { Box, BoxProps, Text, TextProps } from '@chakra-ui/react';

type PreviewDataRowProps = {
  label: string;
  value: string;
  boxProps?: BoxProps;
  labelProps?: TextProps;
  valueProps?: TextProps;
};
function PreviewDataRow({
  label,
  value,
  boxProps = {},
  labelProps = {},
  valueProps = {},
}: PreviewDataRowProps) {
  return (
    <Box mb={2} {...boxProps}>
      <Text fontSize="xs" color="gray.400" {...labelProps}>
        {label}
      </Text>
      <Text fontSize="sm" {...valueProps}>
        {value}
      </Text>
    </Box>
  );
}

export default PreviewDataRow;
