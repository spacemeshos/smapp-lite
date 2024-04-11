import { useMemo } from 'react';

import { noop } from './func';

const useRPC = <T>(func: (rpc: string) => T, rpc?: string) =>
  useMemo(() => (rpc ? func(rpc) : noop), [rpc, func]);

export default useRPC;
