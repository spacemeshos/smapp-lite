import { useNavigate } from 'react-router-dom';

import { Button } from '@chakra-ui/react';
import { IconArrowNarrowLeft } from '@tabler/icons-react';

import { noop } from '../utils/func';

type Props = {
  onClick?: () => void;
};

function BackButton({ onClick = noop }: Props): JSX.Element {
  const navigate = useNavigate();

  return (
    <Button
      leftIcon={<IconArrowNarrowLeft />}
      onClick={() => {
        onClick();
        navigate(-1);
      }}
    >
      Back
    </Button>
  );
}

export default BackButton;
