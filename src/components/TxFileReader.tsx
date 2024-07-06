import { PropsWithChildren, useRef } from 'react';

import { HexString, isHexString } from '../types/common';
import { toHexString } from '../utils/hexString';

type TxFileReaderProps = PropsWithChildren<{
  multiple?: boolean;
  accept?: string;
  onRead: (txs: HexString[]) => void;
  onError: (err: Error) => void;
}>;

type FileData = { name: string; content: string };

const readFile = (file: File): Promise<FileData> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (fileReader.result) {
        const content =
          typeof fileReader.result === 'string'
            ? fileReader.result
            : toHexString(fileReader.result, true);
        resolve({ name: file.name, content });
      }
    };
    fileReader.onerror = reject;
    fileReader.readAsText(file, 'UTF-8');
  });

const readAllFiles = (files: File[]): Promise<FileData[]> =>
  Promise.all(files.map(readFile));

function TxFileReader({
  multiple = false,
  accept = undefined,
  children = null,
  onRead,
  onError,
}: TxFileReaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      readAllFiles([...files])
        .then((datas) => {
          datas.forEach(({ name, content }) => {
            if (!isHexString(content)) {
              throw new Error(`${name} has invalid file format`);
            }
          });
          return datas.map(({ content }) => content);
        })
        .then(onRead)
        .catch(onError);
    }
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
  };

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    // eslint-disable-next-line max-len
    // eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <span style={{ display: 'inline' }} onClick={onClick}>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        style={{ display: 'none' }}
      />
      {children}
    </span>
  );
}

export default TxFileReader;
