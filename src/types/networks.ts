import { HexString } from './common';

export type Network = {
  name: string;
  hrp: string;
  jsonRPC: string;
  explorerUrl: string;
  genesisTime: number;
  genesisID: HexString;
  layerDuration: number;
  layersPerEpoch: number;
  isAthena?: boolean;
};

export type NodeStatus = {
  connectedPeers: number;
  isSynced: boolean;
  currentLayer: number;
  appliedLayer: number;
  processedLayer: number;
  latestLayer: number;
};
