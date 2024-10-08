import { Network } from '../types/networks';

const DEFAULT_NETWORKS: Network[] = [
  {
    name: 'MainNet',
    jsonRPC: 'https://wallet-api.spacemesh.network',
    explorerUrl: 'https://explorer.spacemesh.io',
    hrp: 'sm',
    genesisID: '9eebff023abb17ccb775c602daade8ed708f0a50',
    genesisTime: 1689321600000,
    layerDuration: 300,
    layersPerEpoch: 4032,
  },
  {
    name: 'TestNet 15',
    jsonRPC: 'https://testnet-15-api.spacemesh.network',
    explorerUrl: 'https://testnet-15-explorer.spacemesh.network',
    hrp: 'stest',
    genesisID: 'b7abe09c9a92bcd862ea1159437520cd83126974',
    genesisTime: 1724169600000,
    layerDuration: 300,
    layersPerEpoch: 288,
  },
];

export default DEFAULT_NETWORKS;
