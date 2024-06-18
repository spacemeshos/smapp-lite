import { Box, Text, TextProps } from '@chakra-ui/react';

type PreviewDataRowProps = {
  label: string;
  value: string;
  labelProps?: TextProps;
  valueProps?: TextProps;
};
function PreviewDataRow({
  label,
  value,
  labelProps = {},
  valueProps = {},
}: PreviewDataRowProps) {
  return (
    <Box mb={2}>
      <Text fontSize="xs" color="whiteAlpha.600" {...labelProps}>
        {label}
      </Text>
      <Text fontSize="sm" {...valueProps}>
        {value}
      </Text>
    </Box>
  );
}

export default PreviewDataRow;
