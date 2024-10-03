import QRCode from 'react-qr-code';

import { Box, Card, CardBody, Flex, Spinner, Text } from '@chakra-ui/react';
import { O, pipe } from '@mobily/ts-belt';

import {
  useCurrentGenesisID,
  useCurrentHRP,
  useCurrentNetwork,
} from '../hooks/useNetworkSelectors';
import { useCurrentAccount } from '../hooks/useWalletSelectors';
import useAccountData from '../store/useAccountData';
import { MethodSelectors } from '../utils/templates';

function AccountActionHints(): JSX.Element | null {
  const hrp = useCurrentHRP();
  const genesisID = useCurrentGenesisID();
  const currentAccount = useCurrentAccount(hrp);
  const network = useCurrentNetwork();
  const { isSpawnedAccount, getAccountData } = useAccountData();

  const data = pipe(
    O.zip(genesisID, currentAccount),
    O.flatMap(([genID, acc]) =>
      O.zip(
        getAccountData(genID, acc.address),
        O.Some(isSpawnedAccount(genID, acc.address))
      )
    )
  );

  if (O.isNone(data) || !network) return null;
  const [account, isSpawned] = data;
  if (isSpawned) return null;

  const renderContents = () => {
    // No balance
    if (
      account.state.current.balance === '0' ||
      BigInt(account.state.current.balance) < 105000n
    ) {
      return (
        <Flex direction={{ base: 'column', md: 'row' }} w="100%">
          <Box flexGrow={1}>
            <Text fontSize="md" fontWeight="bold" mb={2}>
              Spawn the account first
            </Text>
            <Text fontSize="sm" mb={2}>
              Accounts have to be spawned before they can send funds.
            </Text>
            <Text fontSize="sm" mb={2}>
              To spawn the account, send some SMH to your address, and once
              received, you&apos;ll be able to perform this step.
            </Text>
            <Text fontSize="sm" mb={2}>
              It is also possible to spawn the account using another already
              spawned one.
            </Text>
          </Box>
          <Box
            w={{ base: '100%', md: '50%' }}
            ml={{ base: 0, md: 4 }}
            mt={{ base: 4, md: 0 }}
          >
            <QRCode
              bgColor="var(--chakra-colors-brand-lightGray)"
              fgColor="var(--chakra-colors-brand-darkGreen)"
              style={{
                height: 'auto',
                maxWidth: '200px',
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
              value={account.address}
            />
          </Box>
        </Flex>
      );
    }

    // Spawn transaction is not applied yet
    const hasSpawnTx = account.transactions.some(
      (tx) => tx.template.method === MethodSelectors.Spawn
    );
    if (hasSpawnTx) {
      return (
        <Flex w="100%" direction={{ base: 'column-reverse', md: 'row' }}>
          <Box flexGrow={1}>
            <Text fontSize="md" fontWeight="bold" mb={2}>
              Wait for the Spawn transaction&nbsp;to&nbsp;be&nbsp;applied
            </Text>
            <Text fontSize="sm" mb={2}>
              It may take up to {Math.ceil(network.layerDuration / 60)} minutes.
            </Text>
            <Text fontSize="sm">
              Then you will be able to publish any other transactions.
            </Text>
          </Box>
          <Spinner
            size="xl"
            speed="1s"
            ml={{ base: 0, md: 2 }}
            mb={{ base: 4, md: 0 }}
            color="brand.green"
          />
        </Flex>
      );
    }

    // No spawn transaction
    return (
      <Box w="100%">
        <Text fontSize="md" fontWeight="bold" mb={2}>
          Spawn the account first
        </Text>
        <Text fontSize="sm">
          Now you can spawn the account.
          <br />
          Click the &quot;Send&quot; button above, then click next and
          &quot;Sign &amp; Publish&quot;.
        </Text>
      </Box>
    );
  };

  return (
    <Card
      my={4}
      variant="outline"
      borderColor="brand.green"
      maxW={{ base: '100%', md: '600px' }}
    >
      <CardBody>{renderContents()}</CardBody>
    </Card>
  );
}

export default AccountActionHints;
