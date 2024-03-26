import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { omit } from 'remeda';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Tag,
  Text,
} from '@chakra-ui/react';

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
        ...omit(prev, [from]),
      }));
      setWordsInBank((prev) => [...prev, wordIndex]);
    } else {
      setSlots((prev) => {
        // Move to slot
        const existingWord = prev[slotIndex];
        const fromExisting = existingWord ? { [from]: existingWord } : {};
        return {
          ...(from === 'bank' ? prev : omit(prev, [from])),
          ...fromExisting,
          [slotIndex]: wordIndex,
        };
      });
      if (from === 'bank') {
        setWordsInBank((prev) => prev.filter((v) => v !== wordIndex));
      }
    }
  };

  const allWordsPlaced =
    wordsInBank.length === 0 &&
    Object.entries(slots).every(([k, v]) => parseInt(k, 10) === v);

  return (
    <>
      <BackButton />
      <Text fontSize="lg" mb={4}>
        Let&apos;s verify that you have write down your mnemonic and will be
        able to recover later if needed.
      </Text>
      <DndProvider backend={HTML5Backend}>
        <Card fontSize="sm" margin={[4, null]} borderRadius="xl">
          <CardHeader pb={0}>
            <Text mb={2}>Please, place the missed words on their places:</Text>
            {wordsInBank.map((wordIndex) => (
              <DraggableTag
                key={`word_${words[wordIndex]}}`}
                word={words[wordIndex]}
                index={wordIndex}
                from="bank"
                moveWord={moveWord}
              />
            ))}
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={[2, null, 3]} spacing="10px">
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
                          key={`word_${words[placedWord]}`}
                          word={words[placedWord]}
                          index={placedWord}
                          from={idx}
                          moveWord={moveWord}
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
                    borderRadius="md"
                    borderWidth={1}
                    borderColor="whiteAlpha.800"
                    bg={isSlot ? 'blackAlpha.50' : 'whiteAlpha.50'}
                    _hover={
                      isSlot ? { background: 'blackAlpha.300' } : undefined
                    }
                    p={2}
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
      <Button
        isDisabled={!allWordsPlaced}
        onClick={() => {
          navigate('/create/set-password');
        }}
      >
        Next step
      </Button>
    </>
  );
}

type DraggableTagProps = {
  moveWord: (wordIndex: number, slot: SlotIndex, from: SlotIndex) => void;
  from: SlotIndex;
  full?: boolean;
} & DraggableItem;

// Sub components
function DraggableTag({
  word,
  index,
  moveWord,
  from,
  full,
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
      colorScheme="purple"
      cursor={isDragging ? 'grabbing' : 'grab'}
      opacity={isDragging ? 0.5 : 1}
      userSelect="none"
      fontSize="md"
      onDoubleClick={() => moveWord(index, 'bank', from)}
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

DraggableTag.defaultProps = {
  full: false,
};

type DroppableBoxProps = PropsWithChildren<{
  slot: SlotIndex;
  hasWordInside: boolean;
}>;

function DroppableBox({
  slot,
  children,
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
      borderRadius="md"
      borderWidth={1}
      borderColor="gray.200"
      bg={isOver ? 'blackAlpha.700' : 'blackAlpha.50'}
      p={hasWordInside ? 0 : 2}
    >
      {children}
    </Box>
  );
}

export default VerifyMnemonicScreen;
