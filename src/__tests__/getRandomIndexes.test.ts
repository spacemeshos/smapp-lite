import getRandomIndexes from '../utils/getRandomIndexes';

describe('getRandomIndexes', () => {
  it('Returns unique indexes', () => {
    const arr = ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'd'];
    const res = getRandomIndexes(arr, 4);
    const words = res.map((i) => arr[i]);
    expect(words.sort()).toEqual(['a', 'b', 'c', 'd'].sort());
  });
  it('Throws an error if too few elements', () => {
    const arr = ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'd'];
    expect(() => getRandomIndexes(arr, 10)).toThrow();
  });
  it('Throws an error if too few unique elements', () => {
    const arr = ['a', 'b', 'c', 'a', 'b', 'c'];
    expect(() => getRandomIndexes(arr, 4)).toThrow();
  });
});
