/*
   一个合成事件状态机
   一共有下面几种状态:
   1. 水平拖动位置
   2. 上下拖动位置
   3. 左右调节尺寸
   4. 点击
   5. hover
 */

import { useRef, useEffect } from 'react';
import { inherit, getPosition } from './utils';

function State() {
}

State.prototype.onMouseMove = () => {
}

State.prototype.onMouseDown = () => {
}

State.prototype.onMouseUp = () => {
}

State.prototype.onClick = () => {
}

// 即将切换时触发
State.prototype.mount = () => {
}

// 退出时触发
State.prototype.unmount = () => {
}

State.prototype.getElement = () => {
    throw new Error('not implement');
}

State.prototype.getGraphElement = () => {
    throw new Error('not implement');
}

State.prototype.switchMode = (mode) => {
    throw new Error('not implement');
}

State.prototype.emit = (type, args) => {
    throw new Error('not implement');
}

// 监听模式
const NormalState = inherit(State, function() {
    this.mousedown = false;
});

NormalState.prototype.onClick = function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.emit('click', e);
}

NormalState.prototype.onMouseDown = function(e) {
    this.mousedown = true;
}

NormalState.prototype.onMouseMove = function(e) {
}

export default function useInteractionEvent({ onChange }, deps) {
    const ref = useRef(null);

    useEffect(() => {
        // 初试状态
        let currentMode = new NormalState();

        State.prototype.switchMode = (mode) => {
            if (currentMode) {
                currentMode.unmount();
            }
            mode.mount();
            currentMode = mode;
        }

        State.prototype.emit = (type, args) => {
            onChange(type, args);
        }

        State.prototype.getElement = () => {
            return ref.current;
        }

        currentMode.mount();

        const onClick = (e) => {
            currentMode.onClick(e);
        };

        const onMouseDown = (e) => {
            currentMode.onMouseDown(e);
        };

        const onMouseUp = (e) => {
            currentMode.onMouseUp(e);
        };

        const onMouseMove = (e) => {
            currentMode.onMouseMove(e);
        };

        ref.current.addEventListener('click', onClick);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove, { passive: true });

        return () => {
            ref.current.removeEventListener('click', onClick);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove, { passive: true });
        }
    }, [deps]);

    return ref;

}
