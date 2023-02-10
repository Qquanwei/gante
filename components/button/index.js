import { useCallback, useState } from 'react';
import classNames from 'classnames';

function Button({ className, onClick, ...props }) {
  const [pending, setPending] = useState(false);

  const onClickAsyncButton = useCallback((e) => {
    if (e && onClick && typeof onClick === 'function') {
      const thenable = onClick(e);

      if (thenable && thenable.then && typeof thenable.then === 'function' && typeof thenable.catch === 'function') {
        setPending(true);
        thenable.then((v) => {
          setPending(false);
          return v;
        }).catch((err) => {
          setPending(false);
          throw err;
        });
      }
    }
  }, [onClick]);

  return (
      <div onClick={onClickAsyncButton} className={classNames(className, 'cursor-pointer', {
        'opacity-50 pointer-events-none': pending
      })} {...props} />
  );
}

export default Button;
