import { Network } from '../types/networks';

const DEFAULT_NETWORKS: Network[] = [
  {
    name: 'MainNet',
    jsonRPC: 'https://wallet-api.spacemesh.network',
    explorerUrl: 'https://explorer.spacemesh.io',
    hrp: 'sm',
    genesisID: '9eebff023abb17ccb775c602daade8ed708f0a50',
    genesisTime: 1689310800000,
    layerDuration: 300,
    layersPerEpoch: 4032,
  },
  {
    name: 'TestNet 13',
    jsonRPC: 'https://testnet-13-api.spacemesh.network',
    explorerUrl: 'https://testnet-13-explorer.spacemesh.network',
    hrp: 'stest',
    genesisID: 'cd97832ec3ae9851e6277d8bd88bc17b4508e2b2',
    genesisTime: 1718964000000,
    layerDuration: 300,
    layersPerEpoch: 288,
  },
];

export default DEFAULT_NETWORKS;
