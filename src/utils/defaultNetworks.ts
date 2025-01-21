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
  {
    name: `Athena Devnet 13`,
    jsonRPC: 'https://api-json-devnet-athena-13.spacemesh.network',
    explorerUrl: 'https://explorer-devnet-athena.spacemesh.network',
    hrp: 'atest',
    genesisID: '9cb099842165b76e2a3338717af3059ac030100a',
    genesisTime: 1736870400000,
    layerDuration: 240,
    layersPerEpoch: 30,
    isAthena: true,
  },
];

export default DEFAULT_NETWORKS;
