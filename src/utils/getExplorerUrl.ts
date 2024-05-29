export type ExplorerDataType =
  | 'txs'
  | 'accounts'
  | 'blocks'
  | 'rewards'
  | 'layers'
  | 'epochs'
  | 'smeshers';

const getExplorerUrl = (
  base: string,
  type: ExplorerDataType,
  id: string,
  v2 = false
) => {
  const path = `${v2 ? '/v2' : ''}/${type}/${id}`;
  const url = new URL(path, base);
  return String(url);
};

export default getExplorerUrl;
