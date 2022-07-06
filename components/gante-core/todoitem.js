import { useCallback, useState } from 'react';
import useGante from './useGante';

export default function TodoItem({ item }) {
    const { TODOLIST_WIDTH, SINK_HEIGHT, updateItemTitle } = useGante();
    const [mode, setMode] = useState('preview');

    const onBlur = useCallback((e) => {
        const formData = new FormData(e.currentTarget);
        updateItemTitle(item.id, formData.get('title'));
        setMode('preview');
    }, []);

    const onClick = useCallback((e) => {
        // 双击
        if (e.detail > 1) {
            setMode('edit');
        }
    }, []);

    const onSubmit = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const formData = new FormData(e.currentTarget);
        updateItemTitle(item.id, formData.get('title'));
        setMode('preview');
    }, [updateItemTitle, item]);

    const style= { height: SINK_HEIGHT, display: 'flex', alignItems: 'center' };

    if (mode === 'preview') {
        return (
            <div
                onClick={onClick}
                style={style}>
                { item.title }
            </div>
        )
    } else {
        // 因为React中onBlur使用focusout合成，所以具有冒泡特性。
        return (
            <form action="" onSubmit={onSubmit} style={style} onBlur={onBlur}>
                <input
                    autoFocus
                    style={{ width: '100%', height: '100% '}}
                    name="title"
                    type="text" defaultValue={item.title}/>
            </form>
        );
    }
}
