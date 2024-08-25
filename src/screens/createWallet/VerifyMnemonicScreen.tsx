import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  BoxProps,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Image,
  SimpleGrid,
  Tag,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { D } from '@mobily/ts-belt';
import { IconArrowNarrowRight } from '@tabler/icons-react';

import logo from '../../assets/logo_white.svg';
import BackButton from '../../components/BackButton';
import getRandomIndexes from '../../utils/getRandomIndexes';

import { useWalletCreation } from './WalletCreationContext';

type DraggableItem = {
  word: string;
  index: number;
};

type SlotIndex = number | 'bank';

function VerifyMnemonicScreen(): JSX.Element {
  const ctx = useWalletCreation();
  const navigate = useNavigate();

  const words = useMemo(() => ctx.mnemonic.split(' '), [ctx.mnemonic]);
  const [indexesToCheck, setIndexesToCheck] = useState<number[]>([]);
  const [wordsInBank, setWordsInBank] = useState<number[]>([]);
  const [slots, setSlots] = useState<Record<number, number | null>>(
    indexesToCheck.reduce((acc, nextId) => ({ ...acc, [nextId]: null }), {})
  );
  const columns = useBreakpointValue({ base: 2, md: 3 }) ?? 2;

  useEffect(() => {
    if (words.length < 12) {
      navigate('/');
    } else {
      const selectedWords = getRandomIndexes(words, 4);
      setIndexesToCheck(selectedWords);
      setWordsInBank(selectedWords);
    }
  }, [words, navigate]);

  const moveWord = (
    wordIndex: number,
    slotIndex: SlotIndex,
    from: SlotIndex
  ) => {
    if (slotIndex === from) return;
    if (slotIndex === 'bank') {
      if (from === 'bank') return;
      // Back to bank
      setSlots((prev) => ({
        ...D.deleteKey(prev, from),
      }));
      setWordsInBank((prev) => [...prev, wordIndex]);
    } else {
      setSlots((prev) => {
        // Move to slot
        const existingWord = prev[slotIndex];
        const fromExisting = existingWord ? { [from]: existingWord } : {};
        return {
          ...(from === 'bank' ? prev : D.deleteKey(prev, from)),
          ...fromExisting,
          [slotIndex]: wordIndex,
        };
      });
      if (from === 'bank') {
        setWordsInBank((prev) => prev.filter((v) => v !== wordIndex));
      }
    }
  };

  const placeWord = (wordIndex: number, from: SlotIndex) => {
    if (from === 'bank') {
      const occupiedSlots = Object.keys(slots);
      const freeSlots = indexesToCheck
        .sort((a, b) => a - b)
        .filter((k) => !occupiedSlots.includes(String(k)));
      const nextFreeSlot = freeSlots[0];
      if (!nextFreeSlot) {
        throw new Error('Cannot find next empty slot');
      }
      return moveWord(wordIndex, nextFreeSlot, from);
    }
    return moveWord(wordIndex, 'bank', from);
  };
  const allWordsPlaced = wordsInBank.length === 0;

  const allWordsPlacedCorrectly =
    wordsInBank.length === 0 &&
    Object.entries(slots).every(([k, v]) => parseInt(k, 10) === v);

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      w={{ base: '100%', md: '75%' }}
      maxW="4xl"
    >
      <Image src={logo} width={200} my={8} />

      <DndProvider backend={HTML5Backend}>
        <Card
          fontSize="sm"
          marginY={4}
          padding={0}
          w={{ base: '100%', md: '90%' }}
        >
          <CardHeader pb={0} textAlign="center">
            <Text
              mb={4}
              fontSize={{ base: '16px', md: '20px' }}
              fontFamily="Univers65"
              textAlign="center"
            >
              Let&apos;s verify that you have written down your seed phrase and
              will able to recover your accounts/funds later if needed.
            </Text>

            <Text
              mb={2}
              fontSize={{ base: '11px', md: '14px' }}
              fontFamily="Univers65"
              textAlign="center"
            >
              Please, place the missing words on their places:
            </Text>
            <SimpleGrid columns={[2, 4]} width="100%" alignItems="center">
              {wordsInBank.map((wordIndex) => (
                <DraggableTag
                  placed={false}
                  key={`word_${words[wordIndex]}}`}
                  word={words[wordIndex] ?? ''}
                  index={wordIndex}
                  from="bank"
                  moveWord={moveWord}
                  placeWord={placeWord}
                />
              ))}
            </SimpleGrid>
          </CardHeader>
          <CardBody paddingY={10}>
            <SimpleGrid columns={columns} spacing="0px">
              {words.map((word, idx) => {
                const isSlot = indexesToCheck.includes(idx);

                const isLeftColumn = idx % columns === 0;
                const isRightColumn = (idx + 1) % columns === 0;
                const isTopRow = idx < columns;
                const isBottomRow = idx >= words.length - columns;

                if (isSlot) {
                  const placedWord = slots[idx];
                  const boxProps: BoxProps = {
                    borderTopWidth: isTopRow ? '0px' : '1px',
                    borderBottomWidth: isBottomRow ? '0px' : '1px',
                    borderLeftWidth: isLeftColumn ? '0px' : '1px',
                    borderRightWidth: isRightColumn ? '0px' : '1px',
                    borderColor: 'brand.lightAlphaGray',
                  };
                  return (
                    <DroppableBox
                      // eslint-disable-next-line react/no-array-index-key
                      key={`droppable_${word}_${
                        placedWord ? 'filled' : 'empty'
                      }`}
                      slot={idx}
                      hasWordInside={!!placedWord}
                      boxProps={boxProps}
                    >
                      {placedWord !== null && placedWord !== undefined ? (
                        <DraggableTag
                          placed
                          key={`word_${words[placedWord]}`}
                          word={words[placedWord] ?? ''}
                          index={placedWord}
                          from={idx}
                          moveWord={moveWord}
                          placeWord={placeWord}
                          allWordsPlaced={allWordsPlaced}
                          allWordsPlacedCorrectly={allWordsPlacedCorrectly}
                        />
                      ) : (
                        <Text
                          fontFamily="Univers55"
                          fontSize={{ base: '12px', md: '14px' }}
                        >
                          {idx + 1}.{' '}
                        </Text>
                      )}
                    </DroppableBox>
                  );
                }
                return (
                  <Box
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${idx}_${word}`}
                    borderTopWidth={isTopRow ? '0px' : '1px'}
                    borderBottomWidth={isBottomRow ? '0px' : '1px'}
                    borderLeftWidth={isLeftColumn ? '0px' : '1px'}
                    borderRightWidth={isRightColumn ? '0px' : '1px'}
                    borderColor="brand.lightAlphaGray"
                    p={{ base: 2, md: 4 }}
                    bg="brand.darkGreen"
                    _hover={
                      isSlot ? { background: 'blackAlpha.300' } : undefined
                    }
                  >
                    <Text
                      fontFamily="Univers55"
                      fontSize={{ base: '12px', md: '14px' }}
                    >
                      {idx + 1}. {word}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>
          </CardBody>
        </Card>
      </DndProvider>

      <Flex width="100%" justifyContent="space-between">
        <BackButton />

        <Button
          rightIcon={<IconArrowNarrowRight />}
          isDisabled={!allWordsPlacedCorrectly}
          onClick={() => {
            navigate('/create/set-password');
          }}
          variant={allWordsPlacedCorrectly ? 'solid' : 'ghostGray'}
        >
          Next step
        </Button>
      </Flex>
    </Flex>
  );
}

type DraggableTagProps = {
  placed: boolean;
  moveWord: (wordIndex: number, slot: SlotIndex, from: SlotIndex) => void;
  placeWord: (wordIndex: number, from: SlotIndex) => void;
  from: SlotIndex;
  allWordsPlaced?: boolean;
  allWordsPlacedCorrectly?: boolean;
} & DraggableItem;

// Sub components
function DraggableTag({
  placed,
  word,
  index,
  moveWord,
  placeWord,
  from,

  allWordsPlaced = false,
  allWordsPlacedCorrectly = false,
}: DraggableTagProps): JSX.Element {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'word',
    item: { word, index },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ slot: SlotIndex }>();
      if (item && dropResult) {
        moveWord(item.index, dropResult.slot, from);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const fullStyles = placed
    ? {
        p: 0,
        m: 0,
        minW: 0,
        borderWidth: '0px',
        minH: 19,
      }
    : {
        p: 2,
        m: 2,
        minW: 24,
        borderWidth: '2px',
        minH: 19,
      };

  return (
    <Tag
      ref={dragRef}
      bg="transparent"
      color={
        placed && allWordsPlaced && !allWordsPlacedCorrectly
          ? 'brand.red'
          : 'brand.green'
      }
      borderColor="brand.green"
      borderRadius="full"
      cursor={isDragging ? 'grabbing' : 'grab'}
      opacity={isDragging ? 0.5 : 1}
      userSelect="none"
      alignItems="center"
      justifyContent="center"
      onClick={() => placeWord(index, from)}
      {...fullStyles}
    >
      {placed && typeof from === 'number' ? (
        <Text fontFamily="Univers55" fontSize={{ base: '12px', md: '14px' }}>
          {from + 1}. {word}
        </Text>
      ) : (
        <Text fontFamily="Univers55" fontSize={{ base: '12px', md: '14px' }}>
          {word}
        </Text>
      )}
    </Tag>
  );
}

type DroppableBoxProps = PropsWithChildren<{
  slot: SlotIndex;
  hasWordInside: boolean;
  boxProps: BoxProps;
}>;

function DroppableBox({
  slot,
  children = '',
  hasWordInside,
  boxProps,
}: DroppableBoxProps): JSX.Element {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'word',
    drop: () => ({ slot }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <Box
      ref={dropRef}
      {...boxProps}
      bg={hasWordInside ? '#0B221C' : 'brand.darkGreen'}
      p={{ base: 2, md: 4 }}
    >
      {children}
    </Box>
  );
}

export default VerifyMnemonicScreen;
