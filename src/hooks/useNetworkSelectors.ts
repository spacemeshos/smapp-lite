import { O } from '@mobily/ts-belt';

import useNetworks from '../store/useNetworks';
import { DEFAULT_HRP } from '../utils/constants';

// eslint-disable-next-line import/prefer-default-export
export const useCurrentHRP = () => {
  const { getCurrentNetwork } = useNetworks();
  const currentNetwork = getCurrentNetwork();
  return O.mapWithDefault(currentNetwork, DEFAULT_HRP, (net) => net.hrp);
};
