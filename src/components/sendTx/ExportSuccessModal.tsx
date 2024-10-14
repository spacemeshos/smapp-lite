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
          <Text mb={2}>To complete the transaction, you need to:</Text>

          {templateAddress === StdPublicKeys.MultiSig ||
          templateAddress === StdPublicKeys.Vesting ? (
            <>
              <List styleType="auto" stylePosition="inside">
                <ListItem>
                  if you own one of required keys — import the transaction and
                  sign
                  {isSigned ? ' again' : ' it'},
                </ListItem>
                <ListItem>send the exported file to other parties,</ListItem>
                <ListItem>
                  collect all the signatures, import them and publish,
                </ListItem>
              </List>
              <Text mt={2}>
                Signatures might be collected in sync or async way, so you can
                end the signed transaction to all other parties and ask them to
                sign it. Once you have collect enough signatures, you can import
                all of them at once, the signatures will be combined
                automatically.
              </Text>
            </>
          ) : (
            <List styleType="auto" stylePosition="inside">
              <ListItem>import the transaction,</ListItem>
              {!isSigned && <ListItem>sign it,</ListItem>}
              <ListItem>publish the signed transaction.</ListItem>
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
