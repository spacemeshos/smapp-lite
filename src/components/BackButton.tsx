import { useNavigate } from 'react-router-dom';

import { Button } from '@chakra-ui/react';
import { IconArrowNarrowLeft } from '@tabler/icons-react';

type Props = {
  onClick?: () => void;
};

function BackButton({ onClick }: Props): JSX.Element {
  const navigate = useNavigate();

  return (
    <Button
      leftIcon={<IconArrowNarrowLeft />}
      onClick={() => {
        if (onClick) {
          onClick();
        }
        navigate(-1);
      }}
    >
      Back
    </Button>
  );
}

BackButton.defaultProps = {
  onClick: null,
};

export default BackButton;
