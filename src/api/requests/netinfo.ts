import { fromBase64 } from '../../utils/base64';
import fetchJSON from '../../utils/fetchJSON';
import { toHexString } from '../../utils/hexString';
import {
  GenesisIDResponseSchema,
  GenesisTimeResponseSchema,
} from '../schemas/mesh';
import { NodeStatusSchema } from '../schemas/node';

export const fetchGenesisTime = (rpc: string) =>
  fetchJSON(`${rpc}/v1/mesh/genesistime`, { method: 'POST' })
    .then(GenesisTimeResponseSchema.parse)
    .then((x) => parseInt(x.unixtime.value, 10));

export const fetchGenesisId = (rpc: string) =>
  fetchJSON(`${rpc}/v1/mesh/genesisid`, { method: 'POST' })
    .then(GenesisIDResponseSchema.parse)
    .then((x) => toHexString(fromBase64(x.genesisId), true));

export const fetchNodeStatus = (rpc: string) =>
  fetchJSON(`${rpc}/v1/node/status`, { method: 'POST' })
    .then(NodeStatusSchema.parse)
    .then(({ status }) => ({
      connectedPeers: parseInt(status.connectedPeers, 10),
      isSynced: status.isSynced,
      syncedLayer: status.syncedLayer.number,
      topLayer: status.topLayer.number,
      verifiedLayer: status.verifiedLayer.number,
    }));

export const fetchNetInfo = async (rpc: string) => {
  // TODO: Fetch v1/node/info when api will be available
  const genesisTime = await fetchGenesisTime(rpc);
  const genesisID = await fetchGenesisId(rpc);

  return {
    genesisTime,
    genesisID,
  };
};
