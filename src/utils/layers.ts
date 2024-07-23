export const epochByLayer = (layersPerEpoch: number, layer: number): number =>
  Math.floor(layer / layersPerEpoch);

export const timestampByLayer = (
  genesisTime: number,
  layerDurationSec: number,
  layer: number
): number => layerDurationSec * 1000 * layer + genesisTime;

export const firstLayerInEpoch = (
  layersPerEpoch: number,
  epoch: number
): number => epoch * layersPerEpoch;

export const nextEpochTime = (
  genesisTime: number,
  layerDurationSec: number,
  layersPerEpoch: number,
  layer: number
): number => {
  const curEpoch = epochByLayer(layersPerEpoch, layer);
  return timestampByLayer(
    genesisTime,
    layerDurationSec,
    firstLayerInEpoch(layersPerEpoch, curEpoch + 1)
  );
};

export const layerByTimestamp = (
  genesisTime: number,
  layerDurationSec: number,
  currentTime: number
): number =>
  Math.floor((currentTime - genesisTime) / (layerDurationSec * 1000));
