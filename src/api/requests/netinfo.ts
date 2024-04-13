import parse from 'parse-duration';

import { fromBase64 } from '../../utils/base64';
import fetchJSON from '../../utils/fetchJSON';
import { toHexString } from '../../utils/hexString';
import { NetworkInfoResponseSchema } from '../schemas/network';
import { NodeStatusSchema } from '../schemas/node';

export const fetchNetworkInfo = (rpc: string) =>
  fetchJSON(`${rpc}/spacemesh.v2alpha1.NetworkService/Info`, {
    method: 'POST',
  })
    .then(NetworkInfoResponseSchema.parse)
    .then((res) => ({
      ...res,
      genesisId: toHexString(fromBase64(res.genesisId)),
      genesisTime: new Date(res.genesisTime).getTime(),
      layerDuration: (parse(res.layerDuration) || 0) / 1000,
    }));

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
