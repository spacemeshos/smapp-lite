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
    name: 'TestNet 16',
    jsonRPC: 'https://testnet-16-api.spacemesh.network',
    explorerUrl: 'https://testnet-16-explorer.spacemesh.network',
    hrp: 'stest',
    genesisID: 'eb7a21b477eb5b08092895ae5fde01f312d9fcd7',
    genesisTime: 1734796800000,
    layerDuration: 300,
    layersPerEpoch: 288,
  },
];

export default DEFAULT_NETWORKS;
