import { formatSmidge } from '../utils/smh';

describe('smh', () => {
  describe('formatSmidge', () => {
    const check = (input: bigint | string | number, expected: string) => {
      it(`should format ${input} as ${expected}`, () => {
        expect(formatSmidge(input)).toEqual(expected);
      });
    };

    check(0, '0 SMH');
    check(1, '1 Smidge');
    check(12500, '12500 Smidge');
    check(10 ** 10, '10 SMH');
    check(10 ** 10 + 2315, '10.231 SMH');

    check('0', '0 SMH');
    check('1', '1 Smidge');
    check('12500', '12500 Smidge');
    check(String(10 ** 10), '10 SMH');
    check(String(10 ** 10 + 2315), '10.231 SMH');

    check(0n, '0 SMH');
    check(1n, '1 Smidge');
    check(12500n, '12500 Smidge');
    check(10n ** 10n, '10 SMH');
    check(2681927462728471910n, '2681927462.728 SMH');
  });
});
