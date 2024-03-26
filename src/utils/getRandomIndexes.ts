function getRandomIndexes<T>(array: T[], amount: number): number[] {
  const uniqueElements = Array.from(new Set(array));
  if (uniqueElements.length < amount) {
    throw new Error(
      'Not enough unique elements in array to get random indexes'
    );
  }

  const uniqueIndexes: number[] = [];
  while (uniqueIndexes.length < amount) {
    const randomIndex = Math.floor(Math.random() * uniqueElements.length);
    if (!uniqueIndexes.includes(randomIndex)) {
      uniqueIndexes.push(randomIndex);
    }
  }

  return uniqueIndexes;
}

export default getRandomIndexes;
