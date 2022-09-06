import { useMemo } from 'react';
import classNames from 'classnames';


export default function StatusBar({ className, children }) {
  return (
    <div className={classNames(className, 'h-5 flex items-center mx-12 px-2 box-border bg-gray-500/25')}>
      { children }
    </div>
  );
}
