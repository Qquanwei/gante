import { useCallback, useRef } from 'react';

function Input({ onChange, placeholder }) {
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
    <form className="inline-flex p-1 border-4 rounded-lg border-black w-3/6" onSubmit={onSubmit}>
      <input ref={iptRef}
             placeholder={placeholder}
             name="input"
             type="text"
             autoFocus
             className="h-8 w-full border-0 focus:outline-0 font-bold text-xl" />
    </form>
  );
}

export default Input;
