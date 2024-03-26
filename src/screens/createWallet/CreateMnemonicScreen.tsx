import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { useCopyToClipboard } from '@uidotdev/usehooks';

import BackButton from '../../components/BackButton';
import useWallet from '../../store/useWallet';

import { useWalletCreation } from './WalletCreationContext';

function CreateMnemonicScreen(): JSX.Element {
  const { generateMnemonic } = useWallet();
  const ctx = useWalletCreation();
  const [mnemonic, setMnemonic] = useState(ctx.mnemonic || generateMnemonic());
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();
  const navigate = useNavigate();

  let timeout: ReturnType<typeof setTimeout>;

  const regenerateMnemonic = () => {
    setMnemonic(generateMnemonic());
  };
  const onCopyClick = () => {
    clearTimeout(timeout);
    copy(mnemonic);
    setIsCopied(true);
    timeout = setTimeout(() => {
      setIsCopied(false);
    }, 5000);
  };

  return (
    <>
      <BackButton />
      <Text fontSize="lg" mb={4}>
        Create a new wallet
      </Text>
      <Button onClick={regenerateMnemonic} pt={2} pb={2} pl={4} pr={4}>
        Generate new mnemonics
      </Button>
      <Card fontSize="sm" margin={[4, null]} borderRadius="xl">
        <CardHeader pb={0}>
          <Text color="orange.500" textAlign="center">
            Please, save the mnemonic to the safe place and do not share with
            anyone.
          </Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={[2, null, 3]} spacing="10px">
            {mnemonic.split(' ').map((word, idx) => (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={`${idx}_${word}`}
                borderRadius="md"
                borderWidth={1}
                borderColor="whiteAlpha.800"
                bg="whiteAlpha.50"
                p={2}
              >
                <Text as="span" fontSize="xx-small">
                  {idx + 1}.{' '}
                </Text>
                {word}
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
        <CardFooter pt={0} flexDirection="column">
          <Button
            onClick={onCopyClick}
            width="100%"
            disabled={isCopied}
            colorScheme={isCopied ? 'gray' : undefined}
            color={isCopied ? 'green.300' : undefined}
          >
            {isCopied ? 'Mnemonic is copied to clipboard' : 'Copy to clipboard'}
          </Button>
        </CardFooter>
      </Card>
      <Button
        pt={2}
        pb={2}
        pl={4}
        pr={4}
        onClick={() => {
          ctx.setMnemonic(mnemonic);
          navigate('/create/verify-mnemonic');
        }}
      >
        Next step
      </Button>
    </>
  );
}

export default CreateMnemonicScreen;
