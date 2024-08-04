import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  SimpleGrid,
  Tag,
  Text,
  Image,
} from '@chakra-ui/react';
import { D } from '@mobily/ts-belt';

import BackButton from '../../components/BackButton';
import getRandomIndexes from '../../utils/getRandomIndexes';

import { useWalletCreation } from './WalletCreationContext';
import logo from '../../assets/logo_white.svg';
import { IconArrowNarrowRight } from '@tabler/icons-react';

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

  const allWordsPlaced =
    wordsInBank.length === 0 &&
    Object.entries(slots).every(([k, v]) => parseInt(k, 10) === v);

  return (
    <Flex flexDir="column" alignItems="center">
      <Image src={logo} width={200} mb={8} />

      <DndProvider backend={HTML5Backend}>
        <Card fontSize="sm" marginY={4} paddingX={20} paddingY={5}>
          <CardHeader pb={0} maxW="xl">
            <Text fontSize="lg" mb={4}>
              Let&apos;s verify that you have written down your seed phrase and
              will able to recover your accounts/funds later if needed.
            </Text>

            <Text mb={2} textAlign="center">
              Please, place the missing words on their places:
            </Text>
            <Flex width="100%" justifyContent="center">
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
            </Flex>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={[2, null, 3]} spacing="0px">
              {words.map((word, idx) => {
                const isSlot = indexesToCheck.includes(idx);
                if (isSlot) {
                  const placedWord = slots[idx];
                  return (
                    <DroppableBox
                      // eslint-disable-next-line react/no-array-index-key
                      key={`droppable_${word}_${
                        placedWord ? 'filled' : 'empty'
                      }`}
                      slot={idx}
                      hasWordInside={!!placedWord}
                    >
                      {placedWord !== null && placedWord !== undefined ? (
                        <DraggableTag
                          placed={true}
                          key={`word_${words[placedWord]}`}
                          word={words[placedWord] ?? ''}
                          index={placedWord}
                          from={idx}
                          moveWord={moveWord}
                          placeWord={placeWord}
                          full
                        />
                      ) : (
                        <Text as="span" fontSize="xx-small">
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
                    borderWidth={1}
                    borderColor="spacemesh.900"
                    p={2}
                    bg={isSlot ? 'spacemesh.900' : 'spacemesh.850'}
                    _hover={
                      isSlot ? { background: 'blackAlpha.300' } : undefined
                    }
                  >
                    <Text as="span" fontSize="xx-small">
                      {idx + 1}.{' '}
                    </Text>
                    {word}
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
          isDisabled={!allWordsPlaced}
          onClick={() => {
            navigate('/create/set-password');
          }}
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
  full?: boolean;
} & DraggableItem;

// Sub components
function DraggableTag({
  placed,
  word,
  index,
  moveWord,
  placeWord,
  from,
  full = false,
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

  const fullStyles = full
    ? {
        display: 'block',
        width: '100%',
        height: '100%',
        p: 2,
      }
    : {
        p: 2,
        m: 1,
      };

  return (
    <Tag
      ref={dragRef}
      bg="brand.darkGreen"
      color="brand.green"
      borderColor="brand.green"
      borderWidth={placed ? '0px' : '2px'}
      borderRadius="full"
      cursor={isDragging ? 'grabbing' : 'grab'}
      opacity={isDragging ? 0.5 : 1}
      userSelect="none"
      minW={placed ? 0 : 24}
      fontSize="md"
      alignItems="center"
      justifyContent="center"
      onClick={() => placeWord(index, from)}
      {...fullStyles}
    >
      {full && typeof from === 'number' && (
        <Text as="span" fontSize="xx-small">
          {from + 1}.{' '}
        </Text>
      )}
      {word}
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
      borderWidth={1}
      borderColor="spacemesh.900"
      bg={isOver ? 'spacemesh.900' : 'spacemesh.900'}
      p={hasWordInside ? 0 : 2}
    >
      {children}
    </Box>
  );
}

export default VerifyMnemonicScreen;
