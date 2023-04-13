import { useCallback, useRef } from 'react';
import classNames from 'classnames';

function Input({ onChange, placeholder, className, children }) {
  const iptRef = useRef(null);

  const onSubmit = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    if (onChange && iptRef.current.value) {
      const form = new FormData(event.target);
      onChange(form.get('input'));
      iptRef.current.value = '';
    }
  }, [onChange]);

  return (
    <form className={classNames("inline-flex focus-within:border-sky-500 border border-gray-300 rounded", className)} onSubmit={onSubmit}>
      <input ref={iptRef}
        placeholder={placeholder}
        name="input"
        type="text"
        className="w-full rounded px-2 border-0 focus:outline-0" />
      {
        children
      }
    </form>
  );
}

export default Input;
