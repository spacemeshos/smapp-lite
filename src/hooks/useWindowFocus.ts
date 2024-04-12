import { useEffect, useState } from 'react';

function useWindowFocus() {
  const [focused, setFocused] = useState(true);
  useEffect(() => {
    const focusHandler = () => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('Window is focused');
        return;
      }
      setFocused(true);
    };
    const blurHandler = () => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('Window is blurred');
        return;
      }
      setFocused(false);
    };
    window.addEventListener('focus', focusHandler);
    window.addEventListener('blur', blurHandler);
    return () => {
      window.removeEventListener('focus', focusHandler);
      window.removeEventListener('blur', blurHandler);
    };
  }, []);

  return focused;
}

export default useWindowFocus;
