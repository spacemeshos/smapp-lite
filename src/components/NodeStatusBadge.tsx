import { Badge, Box, Card, CardBody, Text } from '@chakra-ui/react';

import useNetworks from '../store/useNetworks';
import useNetworkStatus from '../store/useNetworkStatus';

function NodeStatusBadge(): JSX.Element | null {
  const { hasCurrentNetwork } = useNetworks();
  const { status, error } = useNetworkStatus();

  if (!hasCurrentNetwork() || status?.isSynced) return null;

  if (error) {
    return (
      <Card
        variant="outline"
        borderColor="brand.red"
        fontSize="sm"
        width="100%"
        mt={2}
      >
        <CardBody>
          <Text textColor="brand.red" mb={2}>
            Error: {error.message}
          </Text>
          Please choose another public RPC.
        </CardBody>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card
        variant="outline"
        borderColor="brand.gray"
        fontSize="sm"
        width="100%"
        mt={2}
      >
        <CardBody>Please wait, connecting to the network...</CardBody>
      </Card>
    );
  }

  return (
    <Card
      variant="outline"
      borderColor="orange"
      fontSize="sm"
      width="100%"
      mt={2}
    >
      <CardBody>
        The remote node is syncing. Please wait or choose another public RPC.
        <Box mt={2}>
          <Badge mr={2}>Connected peers: {status.connectedPeers}</Badge>
          <Badge mr={2}>
            Layer: {status.processedLayer} / {status.currentLayer}
          </Badge>
        </Box>
      </CardBody>
    </Card>
  );
}

export default NodeStatusBadge;
