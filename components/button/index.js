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
      <button onClick={onClickAsyncButton} className={classNames(className, 'h-[42px] inline-flex items-center justify-center rounded cursor-pointer hover:scale-[.95] border border-gray-300 p-2 transition-all select-none whitespace-nowrap', {
        'opacity-50 pointer-events-none': pending
      })} {...props} />
  );
}

export default Button;
