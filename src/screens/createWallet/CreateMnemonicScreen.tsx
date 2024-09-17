import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { IconArrowNarrowRight } from '@tabler/icons-react';

import BackButton from '../../components/BackButton';
import GreenHeader from '../../components/welcome/GreenHeader';
import Logo from '../../components/welcome/Logo';
import useCopy from '../../hooks/useCopy';
import useWallet from '../../store/useWallet';

import { useWalletCreation } from './WalletCreationContext';

function CreateMnemonicScreen(): JSX.Element {
  const { generateMnemonic } = useWallet();
  const ctx = useWalletCreation();
  const [mnemonic, setMnemonic] = useState(ctx.mnemonic || generateMnemonic());
  const navigate = useNavigate();
  const columns = useBreakpointValue({ base: 2, md: 3 }, { ssr: false });
  const { isCopied, onCopy } = useCopy();

  const regenerateMnemonic = () => {
    setMnemonic(generateMnemonic());
  };
  const onCopyClick = () => onCopy(mnemonic);

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      w={{ base: '100%', md: '75%' }}
      mb={4}
    >
      <Logo />

      <Box
        px={4}
        w={{ base: '100%', md: '90%' }}
        minH={{ base: '175px', md: '195px' }}
        textAlign="center"
      >
        <GreenHeader>Create a new wallet</GreenHeader>
        <Text
          as="strong"
          textAlign="center"
          color="brand.lightGray"
          fontSize={{ base: '16px', md: '20px' }}
          fontFamily="Univers65"
        >
          Please, save the mnemonic to the safe place and do not share with
          anyone.
        </Text>
        <Box>
          <Button
            variant="linkWhite"
            onClick={regenerateMnemonic}
            fontSize="sm"
            fontWeight="normal"
            my={4}
          >
            Generate new mnemonics
          </Button>
        </Box>
      </Box>
      <Box px={4} w={{ base: '100%', md: '90%' }}>
        <SimpleGrid columns={columns} spacing={0} gap="1px" bg="whiteAlpha.200">
          {mnemonic.split(' ').map((word, idx) => (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={`${idx}_${word}`}
              bg="brand.darkGreen"
              p={{ base: 2, md: 3 }}
              fontSize={{ base: '12px', md: '14px' }}
            >
              <Text
                as="span"
                color="whiteAlpha.400"
                fontFamily="Univers55"
                fontSize={{ base: '12px', md: '14px' }}
              >
                {idx + 1}.{' '}
              </Text>
              {word}
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box width="100%" mt={10}>
        <Box mb={4} display={{ base: 'flex', md: 'none' }}>
          <Button
            variant="linkWhite"
            onClick={onCopyClick}
            width="100%"
            disabled={isCopied}
          >
            {isCopied ? 'Copied to clipboard!' : 'Copy to clipboard'}
          </Button>
        </Box>

        <Flex width="100%" justifyContent="space-between">
          <BackButton />
          <Box display={{ base: 'none', md: 'flex' }}>
            <Button
              variant="linkWhite"
              onClick={onCopyClick}
              width="100%"
              disabled={isCopied}
            >
              {isCopied ? 'Copied to clipboard!' : 'Copy to clipboard'}
            </Button>
          </Box>
          <Button
            rightIcon={<IconArrowNarrowRight />}
            paddingX={4}
            paddingY={2}
            onClick={() => {
              ctx.setMnemonic(mnemonic);
              navigate('/create/verify-mnemonic');
            }}
            variant="green"
          >
            Next step
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}

export default CreateMnemonicScreen;
