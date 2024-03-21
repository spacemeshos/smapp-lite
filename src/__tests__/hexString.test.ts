import { fromHexString, toHexString } from '../utils/hexString';

describe('HexString conversion', () => {
  it('fromHexString', () => {
    expect(fromHexString('0x01ff')).toEqual(Uint8Array.from([1, 255]));
    expect(fromHexString('01ff')).toEqual(Uint8Array.from([1, 255]));
  });
  it('toHexString', () => {
    expect(toHexString(Uint8Array.from([1, 255]))).toEqual('01ff');
    expect(toHexString(Uint8Array.from([1, 255]), true)).toEqual('0x01ff');
    expect(toHexString(Uint8Array.from([255, 255]), true)).toEqual('0xffff');
  });
});
