/*
   一个合成事件状态机
   一共有下面几种状态:
   1. 水平拖动位置
   2. 上下拖动位置
   3. 左右调节尺寸
   4. 点击
   5. hover

   会将子元素下面 data-role = left-dragger, right-dragger 作为左右抓手
 */

import ReactDOM from 'react-dom';
import { useRef, useEffect} from 'react';
import { inherit, getPosition } from './utils';
import useGante from './useGante';

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

State.prototype.onMouseOver = () => {
}

State.prototype.onMouseLeave = () => {
}

// 即将切换时触发
State.prototype.mount = () => {
}

// 退出时触发
State.prototype.unmount = () => {
}

State.prototype.getGraphElement = () => {
    throw new Error('not implement');
}

// 监听模式
const NormalState = inherit(State, function() {
    this.mousedown = false;
});

NormalState.prototype.mount = function() {
    const element = this.machine.getElement();
    this.leftDragger = element.querySelector('[data-role=left-dragger]');
    this.rightDragger = element.querySelector('[data-role=right-dragger]');

    this.leftClick = (e) => {
        this.machine.switchMode(new ResizeState('left', getPosition(this.machine.getGraphElement(), e)));
    }

    this.rightClick = (e) => {
        this.machine.switchMode(new ResizeState('right', getPosition(this.machine.getGraphElement(), e)));
    }

    this.leftDragger.addEventListener('mousedown', this.leftClick);
    this.rightDragger.addEventListener('mousedown', this.rightClick);
}

NormalState.prototype.unmount = function() {
    this.leftDragger.removeEventListener('mousedown', this.leftClick);
    this.rightDragger.removeEventListener('mousedown', this.rightClick);
}

NormalState.prototype.onClick = function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.machine.emit('click', e);
}

NormalState.prototype.onMouseDown = function(e) {
    this.mousedown = true;
}

NormalState.prototype.onMouseOver = function(e) {
    this.machine.emit('hover', true);
}

NormalState.prototype.onMouseLeave = function(e) {
    this.machine.emit('hover', false);
}

// 左边移动或右边移动, mode = left / right
var ResizeState = inherit(State, function(mode = 'left', initPosition) {
    this.mode = mode;
    this.initPosition = initPosition;

});

ResizeState.prototype.mount = function() {
    this.initWidth = this.machine.getElement().offsetWidth;
}
ResizeState.prototype.onMouseUp = function() {
    this.machine.switchMode(new NormalState());
}

ResizeState.prototype.onMouseMove = function(e) {
    const currentPosition = getPosition(this.machine.getGraphElement(), e);
    const { x } = currentPosition.diff(this.initPosition);
    const element = this.machine.getElement();
    this.machine.emit('resize', {
        width: this.initWidth + x
    });
}

function StateMachine({ element, graphElement, onChange }) {
    this.onChange = onChange;
    this.element = element;
    this.graphElement = graphElement;


    this.onClick = (e) => {
        this.currentState.onClick(e);
    };

    this.onMouseDown = (e) => {
        this.currentState.onMouseDown(e);
    };

    this.onMouseUp = (e) => {
        this.currentState.onMouseUp(e);
    };

    this.onMouseMove = (e) => {
        this.currentState.onMouseMove(e);
    };

    this.onMouseOver = (e) => {
        this.currentState.onMouseOver(e);
    }

    this.onMouseLeave = (e) => {
        this.currentState.onMouseLeave(e);
    }

    this.element.addEventListener('click', this.onClick);
    this.element.addEventListener('mouseover', this.onMouseOver);
    this.element.addEventListener('mouseleave', this.onMouseLeave);
    this.graphElement.addEventListener('mousedown', this.onMouseDown);
    this.graphElement.addEventListener('mouseup', this.onMouseUp);
    this.graphElement.addEventListener('mousemove', this.onMouseMove, { passive: true });

    this.currentState = new NormalState();
    this.currentState.machine = this;
    this.currentState.mount();
}

StateMachine.prototype.dispose = function() {
    this.element.removeEventListener('click', this.onClick);
    this.element.removeEventListener('mouseover', this.onMouseOver);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.graphElement.removeEventListener('mousedown', this.onMouseDown);
    this.graphElement.removeEventListener('mouseup', this.onMouseUp);
    this.graphElement.removeEventListener('mousemove', this.onMouseMove, { passive: true });
    this.currentState.unmount();
}

StateMachine.prototype.getElement = function() {
    return this.element;
}

StateMachine.prototype.switchMode = function(newMode) {
    newMode.machine = this;
    if (this.currentState) {
        this.currentState.unmount();
    }
    newMode.mount();
    this.currentState = newMode;
}

StateMachine.prototype.getGraphElement = function() {
    return this.graphElement;
}

StateMachine.prototype.emit = function(type, args) {
    ReactDOM.unstable_batchedUpdates(() => {
        this.onChange(type, args);
    });
}

export default function useInteractionEvent({ onChange }, deps) {
    const ref = useRef(null);
    const { graphRef } = useGante();

    useEffect(() => {
        const machine = new StateMachine({
            graphElement: graphRef.current,
            element: ref.current,
            onChange: onChange
        });

        return () => {
            machine.dispose();
        }
    }, deps);

    return ref;

}
