import { noop } from './func';

// eslint-disable-next-line import/prefer-default-export
export const getDisclosureDefaults = () => ({
  getButtonProps: () => ({}),
  getDisclosureProps: () => ({}),
  isControlled: false,
  isOpen: false,
  onOpen: noop,
  onClose: noop,
  onToggle: noop,
});
