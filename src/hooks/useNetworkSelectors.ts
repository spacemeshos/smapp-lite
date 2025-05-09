import { O } from '@mobily/ts-belt';

import useNetworks from '../store/useNetworks';
import { DEFAULT_HRP } from '../utils/constants';

export const useCurrentNetwork = () => {
  const { getCurrentNetwork } = useNetworks();
  return getCurrentNetwork();
};

export const useCurrentHRP = () =>
  O.mapWithDefault(useCurrentNetwork(), DEFAULT_HRP, (net) => net.hrp);

export const useCurrentGenesisID = () =>
  O.map(useCurrentNetwork(), (net) => net.genesisID);

export const useCurrentRPC = () =>
  O.map(useCurrentNetwork(), (net) => net.jsonRPC);

export const useLayerDuration = () =>
  O.map(useCurrentNetwork(), (net) => net.layerDuration);

export const useIsAthena = () =>
  O.mapWithDefault(useCurrentNetwork(), false, (net) => net.isAthena ?? false);
