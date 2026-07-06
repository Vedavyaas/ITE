import { useEffect, useRef } from 'react';

export default function Toast({ message, type = 'success', onDismiss }) {
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer.current);
  }, [onDismiss]);

  return (
    <div className={`toast toast-${type}`} onClick={onDismiss}>
      {type === 'success' ? '✦ ' : '⚠ '}
      {message}
    </div>
  );
}
