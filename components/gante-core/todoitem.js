import { useCallback, useState } from 'react';
import useGante from './useGante';

export default function TodoItem({ item }) {
  const { SINK_HEIGHT, updateItemTitle } = useGante();
  const [mode, setMode] = useState('preview');

  const onBlur = useCallback((e) => {
    const formData = new FormData(e.currentTarget);
    updateItemTitle(item.id, formData.get('title'));
    setMode('preview');
  }, [updateItemTitle]);

  const onClick = useCallback((e) => {
    setMode('edit');
  }, []);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const formData = new FormData(e.currentTarget);
    updateItemTitle(item.id, formData.get('title'));
    setMode('preview');
  }, [updateItemTitle, item]);

  const style= { height: SINK_HEIGHT };

  if (mode === 'preview') {
    return (
      <div
        className="flex items-center cursor-pointer px-2"
        onClick={onClick}
        style={style}>
        { item.title }
      </div>
    );
  } else {
    // 因为React中onBlur使用focusout合成，所以具有冒泡特性。
    return (
        <form onSubmit={onSubmit} style={style} onBlur={onBlur} className="flex items-center cursor-pointer">
          <input
            autoFocus
            className="w-full"
            name="title"
            type="text" defaultValue={item.title}/>
        </form>
    );
  }
}
