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
};

export type NodeStatus = {
  connectedPeers: number;
  isSynced: boolean;
  syncedLayer: number;
  topLayer: number;
  verifiedLayer: number;
};
