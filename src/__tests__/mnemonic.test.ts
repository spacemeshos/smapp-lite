import { normalizeMnemonic } from '../utils/mnemonic';

describe('Mnemonic', () => {
  describe('normalizeMnemonic', () => {
    it('returns the same mnemonic', () => {
      expect(normalizeMnemonic('a b c d e f g h i j k l m')).toEqual(
        'a b c d e f g h i j k l m'
      );
    });
    it('replaces new lines with spaces', () => {
      expect(normalizeMnemonic('a\nb\nc\nd\ne\n\n\nf\ng\nh i j k l m')).toEqual(
        'a b c d e f g h i j k l m'
      );
    });
    it('replaces multiple spaces with single space', () => {
      expect(normalizeMnemonic('a   b c d e   f g h  i j  k l m')).toEqual(
        'a b c d e f g h i j k l m'
      );
    });
    it('omits numbers and new lines', () => {
      const input = [
        '1. aaaa',
        '2. bbbb',
        '3. ccccc',
        '4. dd',
        '5. eeee',
        '6. fffff',
        '7. ggg',
        '8. hhhh',
        '9. ii',
        '10. jjjj',
        '11. kkkk',
        '12. lllll',
        '13. mmmm',
        '14. nnnnn',
        '15. oooo',
        '16. pppp',
        '17. qqq',
        '18. rrrrrr',
        '19. sssss',
        '20. tttt',
        '21. uuuu',
        '22. vvvvv',
        '23. wwww',
        '24. xxxxxx',
      ].join('\n');

      expect(normalizeMnemonic(input)).toEqual(
        // eslint-disable-next-line max-len
        'aaaa bbbb ccccc dd eeee fffff ggg hhhh ii jjjj kkkk lllll mmmm nnnnn oooo pppp qqq rrrrrr sssss tttt uuuu vvvvv wwww xxxxxx'
      );
    });
  });
});
