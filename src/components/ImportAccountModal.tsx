import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { StdTemplateKeys } from '@spacemesh/sm-codec';

import usePassword from '../store/usePassword';
import useWallet from '../store/useWallet';
import { Account, AccountWithAddress } from '../types/wallet';
import { isAnyAccount } from '../utils/account';
import { AnySpawnArguments, getTemplateNameByKey } from '../utils/templates';

type ImportAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountWithAddress<AnySpawnArguments>[];
};

function ImportAccountModal({
  isOpen,
  onClose,
  accounts,
}: ImportAccountModalProps): JSX.Element {
  const { createAccount } = useWallet();
  const { withPassword } = usePassword();

  const inputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [accountData, setAccountData] =
    useState<Account<AnySpawnArguments> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!displayName && accountData?.displayName) {
      setDisplayName(accountData.displayName);
    }
    if (isSubmitted) {
      return;
    }
    if (accountData) {
      const dataConflict = accounts.find(
        (acc) =>
          acc.templateAddress === accountData.templateAddress &&
          JSON.stringify(acc.spawnArguments) ===
            JSON.stringify(accountData.spawnArguments)
      );
      if (dataConflict) {
        setError(
          // eslint-disable-next-line max-len
          'You already have this account in the wallet. No need to import it once again.'
        );
        return;
      }
    }
    const nameConflict = accounts.find(
      (acc) => acc.displayName === displayName
    );
    if (nameConflict) {
      setError(
        // eslint-disable-next-line max-len
        `You have account with such a name in the wallet. Please consider picking another display name`
      );
      return;
    }
    setError(null);
  }, [displayName, accounts, accountData, isSubmitted]);

  const close = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setIsSubmitted(false);
    setError(null);
    setAccountData(null);
    setDisplayName('');
    onClose();
  };

  const readAccountFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      if (typeof reader.result !== 'string') {
        setError('Failed to read file');
        return;
      }
      try {
        const newAccount = JSON.parse(reader.result as string);
        if (isAnyAccount(newAccount)) {
          if (!displayName) {
            setDisplayName(newAccount?.displayName ?? '');
          }
          setAccountData({ ...newAccount, displayName });
        } else {
          setError(`Cannot parse the account`);
        }
      } catch (err) {
        setError(`Cannot parse the file: ${err}`);
      }
    };
    reader.readAsText(file);
  };

  const submit = () => {
    if (accountData) {
      setIsSubmitted(true);
      withPassword(
        (password) =>
          createAccount(
            displayName,
            accountData.templateAddress as StdTemplateKeys,
            accountData.spawnArguments,
            password
          ),
        'Import Account',
        // eslint-disable-next-line max-len
        `Please enter the password to create the new account "${displayName}" of type "${getTemplateNameByKey(
          accountData.templateAddress
        )}"`
      )
        .then((x) => x && close())
        .catch((err) => {
          setError(`Failed to open wallet file:\n${err}`);
          setIsSubmitted(false);
        });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center">Import Account</ModalHeader>
        <ModalBody textAlign="center">
          <Text mb={4}>Please select the account file to import.</Text>
          <Input
            ref={inputRef}
            type="file"
            display="none"
            accept=".account"
            onChange={readAccountFile}
          />
          <Button
            size="lg"
            onClick={() => inputRef.current?.click()}
            variant="dark"
            mb={4}
          >
            Select account file
          </Button>
          <FormControl mb={4}>
            <FormLabel fontSize="sm" mb={0}>
              Please set the display name for imported account:
            </FormLabel>
            <Input
              type="text"
              onChange={(e) => setDisplayName(e.target.value)}
              value={displayName}
              border="1px"
              borderRadius="full"
            />
          </FormControl>
          {accountData && (
            <Card variant="outline">
              <CardBody p={2} overflow="auto">
                <Text as="pre" fontSize="xx-small" textAlign="left">
                  Template: {getTemplateNameByKey(accountData.templateAddress)}
                  {'\n\n'}
                  {Object.entries(accountData.spawnArguments).map(
                    ([k, v], i) =>
                      `${i !== 0 ? '\n' : ''}${k}: ${
                        v instanceof Array ? `\n${v.join('\n')}` : v
                      }\n`
                  )}
                </Text>
              </CardBody>
            </Card>
          )}
          {error && (
            <Text mt={4} color="red">
              {error}
            </Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="dark" onClick={submit} ml={2} isDisabled={!!error}>
            Import
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ImportAccountModal;
