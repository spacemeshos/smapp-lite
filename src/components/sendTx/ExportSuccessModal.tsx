import {
  Button,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { StdPublicKeys, StdTemplateKeys } from '@spacemesh/sm-codec';

type Props = {
  templateAddress: StdTemplateKeys;
  isSigned: boolean;
  isOpen: boolean;
  onClose: () => void;
};

function ExportSuccessModal({
  templateAddress,
  isSigned,
  isOpen,
  onClose,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader textAlign="center">
          Transaction
          {isSigned ? ' signed and ' : ' '}
          exported successfully
        </ModalHeader>
        <ModalBody pb={6}>
          <Text mb={2}>To complete the transaction, follow these steps:</Text>

          {templateAddress === StdPublicKeys.MultiSig ||
          templateAddress === StdPublicKeys.Vesting ? (
            <>
              <List styleType="auto" stylePosition="inside">
                <ListItem>
                  If you own one of the required keys — import the transaction
                  and sign it
                  {isSigned ? ' again.' : ' .'},
                </ListItem>
                <ListItem>
                  Send the exported file to other parties if needed.
                </ListItem>
                <ListItem>
                  Collect all the signatures, then import them, and publish the
                  transaction.
                </ListItem>
              </List>
              <Text mt={2}>
                Signatures can be collected either synchronously or
                asynchronously. This means you can send the signed transaction
                to all other parties and request their signatures. Once you have
                gathered enough signatures, you can import them all at once, and
                they will be combined automatically.
              </Text>
            </>
          ) : (
            <List styleType="auto" stylePosition="inside">
              <ListItem>Import this transaction file.</ListItem>
              {!isSigned && <ListItem>Sign it.</ListItem>}
              <ListItem>Publish the signed transaction.</ListItem>
            </List>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="whiteModal" onClick={onClose}>
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ExportSuccessModal;
