import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Tag,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { D } from '@mobily/ts-belt';
import { IconArrowNarrowRight } from '@tabler/icons-react';

import BackButton from '../../components/BackButton';
import Logo from '../../components/welcome/Logo';
import getRandomIndexes from '../../utils/getRandomIndexes';

import { useWalletCreation } from './WalletCreationContext';

type DraggableItem = {
  word: string;
  index: number;
};

type SlotIndex = number | 'bank';

type Slots = {
  bank: number[];
  [key: number]: number | null;
};

function VerifyMnemonicScreen(): JSX.Element {
  const ctx = useWalletCreation();
  const navigate = useNavigate();

  const words = useMemo(() => ctx.mnemonic.split(' '), [ctx.mnemonic]);
  const [indexesToCheck, setIndexesToCheck] = useState<number[]>([]);
  const [slots, setSlots] = useState<Slots>(
    indexesToCheck.reduce((acc, nextId) => ({ ...acc, [nextId]: null }), {
      bank: [],
    } as Slots)
  );
  const columns = useBreakpointValue({ base: 2, md: 3 }) ?? 2;

  useEffect(() => {
    if (words.length < 12) {
      navigate('/');
    } else {
      const selectedWords = getRandomIndexes(words, 4);
      setIndexesToCheck(selectedWords);
      setSlots({ bank: selectedWords });
    }
  }, [words, navigate]);

  const moveWord = (wordIndex: number, to: SlotIndex, from: SlotIndex) => {
    if (to === from) return;
    if (to === 'bank') {
      if (from === 'bank') return;
      // Back to bank
      setSlots((prev) => ({
        ...D.deleteKey(prev, from),
        bank: [...prev.bank, wordIndex],
      }));
    } else {
      setSlots((prev) => {
        // Move to slot
        const existingWord = prev[to];
        const addWord = typeof existingWord === 'number' ? [existingWord] : [];
        return {
          ...prev,
          [to]: wordIndex,
          [from]:
            from === 'bank'
              ? [...prev.bank.filter((x) => x !== wordIndex), ...addWord]
              : existingWord ?? null,
        } as Slots;
      });
    }
  };

  const placeWord = (wordIndex: number, from: SlotIndex) => {
    if (from === 'bank') {
      const occupiedSlots = Object.keys(slots);
      const freeSlots = indexesToCheck
        .sort((a, b) => a - b)
        .filter((k) => !occupiedSlots.includes(String(k)));
      const nextFreeSlot = freeSlots[0];
      if (nextFreeSlot === undefined) {
        throw new Error('Cannot find next empty slot');
      }
      return moveWord(wordIndex, nextFreeSlot, from);
    }
    return moveWord(wordIndex, 'bank', from);
  };
  const allWordsPlaced = slots.bank.length === 0;

  const allWordsPlacedCorrectly =
    slots.bank.length === 0 &&
    Object.entries(slots)
      .filter(([k]) => k !== 'bank')
      .every(([k, v]) => parseInt(k, 10) === v);

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      w={{ base: '100%', md: '75%' }}
      mb={4}
    >
      <Logo />

      <DndProvider backend={HTML5Backend}>
        <Box
          px={4}
          w={{ base: '100%', md: '90%' }}
          minH={{ base: '175px', md: '195px' }}
          textAlign="center"
        >
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
            mt={4}
            mb={2}
            fontSize={{ base: '11px', md: '14px' }}
            fontFamily="Univers65"
            textAlign="center"
          >
            Please, place the missing words on their places:
          </Text>
          <Box px={4} w={{ base: '100%', md: '90%' }}>
            <SimpleGrid columns={[2, 4]} width="100%" alignItems="center">
              {slots.bank.map((wordIndex) => (
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
          </Box>
        </Box>
        <Box px={4} w={{ base: '100%', md: '90%' }}>
          <SimpleGrid
            columns={columns}
            spacing={0}
            gap="1px"
            bg="whiteAlpha.200"
          >
            {words.map((word, idx) => {
              const isSlot = indexesToCheck.includes(idx);

              if (isSlot) {
                const placedWord = slots[idx];

                return (
                  <DroppableBox
                    // eslint-disable-next-line react/no-array-index-key
                    key={`droppable_${word}`}
                    slot={idx}
                    hasWordInside={!!placedWord}
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
                        color="whiteAlpha.400"
                        minH="20px"
                      >
                        {idx + 1}.{' '}
                      </Text>
                    )}
                  </DroppableBox>
                );
              }
              return (
                <Flex
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${idx}_${word}`}
                  p={{ base: 2, md: 3 }}
                  bg="brand.darkGreen"
                  _hover={isSlot ? { background: 'blackAlpha.300' } : undefined}
                  gap={1}
                >
                  <Text
                    fontFamily="Univers55"
                    fontSize={{ base: '12px', md: '14px' }}
                    color="whiteAlpha.400"
                  >
                    {idx + 1}.
                  </Text>
                  <Text
                    fontFamily="Univers55"
                    fontSize={{ base: '12px', md: '14px' }}
                  >
                    {word}
                  </Text>
                </Flex>
              );
            })}
          </SimpleGrid>
        </Box>
      </DndProvider>

      <Flex mt={10} width="100%" justifyContent="space-between">
        <BackButton />

        <Button
          rightIcon={<IconArrowNarrowRight />}
          isDisabled={!allWordsPlacedCorrectly}
          onClick={() => {
            navigate('/create/set-password');
          }}
          variant={allWordsPlacedCorrectly ? 'green' : 'ghostGray'}
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

  const placedStyles = {
    p: 3,
    m: 0,
    borderWidth: 0,
    borderRadius: 0,
    w: '100%',
    h: '100%',
    display: 'block',
    lineHeight: '20px',
  };
  const nonPlacedStyles = {
    p: 2,
    m: 2,
    minW: 24,
    borderWidth: '2px',
    minH: '20px',
  };

  return (
    <Tag
      ref={dragRef}
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
      fontFamily="Univers55"
      fontSize={{ base: '12px', md: '14px' }}
      {...(placed ? placedStyles : nonPlacedStyles)}
    >
      {placed && typeof from === 'number' ? `${from + 1}. ${word}` : word}
    </Tag>
  );
}

type DroppableBoxProps = PropsWithChildren<{
  slot: SlotIndex;
  hasWordInside: boolean;
}>;

function DroppableBox({
  slot,
  children = '',
  hasWordInside,
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
      bg={
        // eslint-disable-next-line no-nested-ternary
        hasWordInside
          ? '#0B221C'
          : isOver
          ? 'blackAlpha.300'
          : 'brand.darkGreen'
      }
      p={hasWordInside ? 0 : { base: 2, md: 3 }}
    >
      {children}
    </Box>
  );
}

export default VerifyMnemonicScreen;
