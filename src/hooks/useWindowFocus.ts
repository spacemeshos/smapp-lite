import { useEffect, useRef, useState } from 'react';

function useWindowFocus(timeout = 0) {
  const [focused, setFocused] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const focusHandler = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setFocused(true);
    };
    const blurHandler = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setFocused(false);
        timeoutRef.current = null;
      }, timeout);
    };
    window.addEventListener('focus', focusHandler);
    window.addEventListener('blur', blurHandler);
    return () => {
      window.removeEventListener('focus', focusHandler);
      window.removeEventListener('blur', blurHandler);
    };
  }, [timeout]);

  return focused;
}

export default useWindowFocus;
