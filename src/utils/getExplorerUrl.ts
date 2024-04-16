export type ExplorerDataType =
  | 'txs'
  | 'accounts'
  | 'blocks'
  | 'rewards'
  | 'layers'
  | 'epochs';

const getExplorerUrl = (base: string, type: ExplorerDataType, id: string) => {
  const path = `/${type}/${id}`;
  const url = new URL(path, base);
  return String(url);
};

export default getExplorerUrl;
