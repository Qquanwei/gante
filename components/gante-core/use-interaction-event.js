/*
  一个合成事件状态机
  一共有下面几种状态:
  1. 水平拖动位置
  2. 上下拖动位置
  3. 左右调节尺寸
  4. 点击
  5. hover

  会将子元素下面 data-role = left-dragger, right-dragger 作为左右抓手
  data-role=ignore-events 将会忽略任何事件响应
*/

import ReactDOM from 'react-dom';
import { useRef, useEffect} from 'react';
import { inherit, getPosition } from './utils';
import useGante from './useGante';

// 如果 globalHoverLock = true, 表示此时全局禁用hover事件。
let globalHoverLock = false;

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

State.prototype.onDragStart = () => {
}

State.prototype.onDragEnd = () => {
}

State.prototype.onDrop = () => {
}

// 即将切换时触发
State.prototype.mount = () => {
}

// 退出时触发
State.prototype.unmount = () => {
}

// 监听模式
const NormalState = inherit(State, function() {
  this.mousedown = false;
});

NormalState.prototype.mount = function() {
  const element = this.machine.getElement();
  this.leftDragger = element.querySelector('[data-role=left-dragger]');
  this.rightDragger = element.querySelector('[data-role=right-dragger]');
  //this.anchor = element.querySelector('[data-role=anchor]');

  this.leftClick = (e) => {
    this.machine.switchMode(new ResizeState('left', getPosition(this.machine.getGraphElement(), e)));
  };

  this.rightClick = (e) => {
    this.machine.switchMode(new ResizeState('right', getPosition(this.machine.getGraphElement(), e)));
  };

  this.anchorClick = (e) => {
    this.machine.switchMode(new AnchorConnect(e));
  };

  this.leftDragger.addEventListener('mousedown', this.leftClick);
  this.rightDragger.addEventListener('mousedown', this.rightClick);
  // this.anchor.addEventListener('mousedown', this.anchorClick);

  this.ignoreEventsEles = element.querySelectorAll('[data-role=ignore-events]');
}

NormalState.prototype.unmount = function() {
  this.leftDragger.removeEventListener('mousedown', this.leftClick);
  this.rightDragger.removeEventListener('mousedown', this.rightClick);
  // this.anchor.removeEventListener('mousedown', this.anchorClick);
}

NormalState.prototype.onMouseDown = function(e) {
  e.preventDefault();
  e.stopPropagation();
  for (let ignoreE of this.ignoreEventsEles) {
    if (ignoreE.contains(e.target)) {
      return;
    }
  }
  this.mousedown = true;
  this.mousePosition = getPosition(this.machine.getGraphElement(), e);
}

NormalState.prototype.onMouseUp = function(e) {
  /*
    对于 ignore-events 类型的元素，我们将不会触发点击事件 这会有利于部分区域有自己的点击行为，不想交给容器处理。
    可以省去无聊的 stopPropagation 环节
   */
  if (this.mousedown) {
    for (let ignoreE of this.ignoreEventsEles) {
      if (ignoreE.contains(e.target)) {
        return;
      }
    }

    this.machine.emit('click', {
      event: e,
      point: getPosition(this.machine.getGraphElement(), e)
    });
  }
  this.mousedown = false;
}

NormalState.prototype.onMouseOver = function(e) {
  this.machine.emit('hover', true);
}

NormalState.prototype.onMouseLeave = function(e) {
  this.machine.emit('hover', false);
}

NormalState.prototype.onMouseMove = function(e) {
  if (this.mousedown) {
    const position = getPosition(this.machine.getGraphElement(), e);
    /*
      当即将移动到一个格子的时候，进入移动状态
    */
    if (Math.abs(position.diff(this.mousePosition).x) > (this.machine.SPOT_WIDTH * 0.9)) {
      this.machine.switchMode(new MoveState(this.mousePosition));
    }
  }
}

// 左边移动或右边移动, mode = left / right
var ResizeState = inherit(State, function(mode = 'left', initPosition) {
  this.mode = mode;
  this.initPosition = initPosition;
});

ResizeState.prototype.mount = function() {
  this.initWidth = this.machine.getElement().offsetWidth;
  this.initLeft = this.machine.getElement().offsetLeft;
  globalHoverLock = true;
}
ResizeState.prototype.onMouseUp = function() {
  this.machine.switchMode(new NormalState());
  globalHoverLock = false;
}

ResizeState.prototype.onMouseMove = function(e) {
  const currentPosition = getPosition(this.machine.getGraphElement(), e);
  const { x } = currentPosition.diff(this.initPosition);
  const element = this.machine.getElement();
  if (this.mode === 'left') {
    this.machine.emit('resize', {
      width: this.initWidth - x,
      left: this.initLeft + x
    })
  } else {
    this.machine.emit('resize', {
      width: this.initWidth + x
    });
  }
}

var MoveState = inherit(State, function(initPosition) {
  this.initPosition = initPosition;
})

MoveState.prototype.mount = function() {
  const element = this.machine.getElement();
  this.left = this.machine.getElement().offsetLeft;
  this.top = this.machine.getElement().offsetTop;
  globalHoverLock = true;

  this.ignoreEventsEles = element.querySelectorAll('[data-role=ignore-events]');
}

MoveState.prototype.unmount = function() {
  globalHoverLock = false;
}

MoveState.prototype.onMouseMove = function(e) {
  const position = getPosition(this.machine.getGraphElement(), e);

  for (let ignoreE of this.ignoreEventsEles) {
    if (ignoreE.contains(e.target)) {
      return;
    }
  }

  this.machine.emit('move', {
    left: Math.max(this.left + position.diff(this.initPosition).x, 0)
  });
  // this.machine.emit('swap', {
  //    top: Math.max(0, this.top + position.diff(this.initPosition).y)
  // })
}

MoveState.prototype.onMouseUp = function(e) {
  // 判断是否还处在的当前元素上，如果为否，则hover为false
  if (!this.machine.getElement().contains(e.target)) {
    this.machine.emit('hover', false);
  }
  this.machine.switchMode(new NormalState());
}


var SortState = inherit(State, function() {
})

SortState.prototype.mount = function() {
  globalHoverLock = true;
}

SortState.prototype.unmount = function() {
  globalHoverLock = false;
}

SortState.prototype.onDragStart = function(event) {
  event.dataTransfer.setData('text/plain', 'hello');
  event.dataTransfer.dropEffect = 'move';
  const div = document.createElement('div');
  div.innerText = 'hello';
  event.dataTransfer.setData('text/html', div);
}

SortState.prototype.onMouseUp = function() {
  this.machine.switchMode(new NormalState());
}
SortState.prototype.onDragEnd = function() {
  this.machine.switchMode(new NormalState());
}

var AnchorConnect = inherit(State, function(event) {
  this.initEvent = event;
});

AnchorConnect.prototype.mount = function() {
  this.initPosition = getPosition(this.machine.getGraphElement(), this.initEvent);
}
AnchorConnect.prototype.unmount = function() {
  this.machine.emit('preview-line', null);
}

AnchorConnect.prototype.onMouseUp = function() {
  this.machine.switchMode(new NormalState());
}

AnchorConnect.prototype.onMouseMove = function(event) {
  const currentPosition = getPosition(this.machine.getGraphElement(), event);
  this.machine.emit('preview-line', {
    from: this.initPosition,
    to: currentPosition
  });
};

function StateMachine({ element, graphElement, onChange, SPOT_WIDTH }) {
  this.onChange = onChange;
  this.element = element;
  this.graphElement = graphElement;
  this.SPOT_WIDTH = SPOT_WIDTH;


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

  this.onDragStart = (e) => {
    this.currentState.onDragStart(e);
  }

  this.onDragEnd = (e) => {
    this.currentState.onDragEnd(e);
  }

  this.onDrop = (e) => {
    this.currentState.onDrop(e);
  }

  // this.element.setAttribute('draggable', "true");
  this.element.addEventListener('click', this.onClick);
  this.element.addEventListener('mouseover', this.onMouseOver);
  this.element.addEventListener('mouseleave', this.onMouseLeave);
  this.element.addEventListener('mousedown', this.onMouseDown);
  this.element.addEventListener('dragstart', this.onDragStart);
  this.element.addEventListener('dragend', this.onDragEnd);
  this.element.addEventListener('drop', this.onDrop);
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
  this.element.removeEventListener('mousedown', this.onMouseDown);
  this.element.removeEventListener('dragstart', this.onDragStart);
  this.element.removeEventListener('dragend', this.onDragEnd);
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

export default function useInteractionEvent({ onChange }) {
  const ref = useRef(null);
  const onChangeRef = useRef(null);
  const { graphRef, SPOT_WIDTH } = useGante();

  onChangeRef.current = onChange;

  useEffect(() => {
    const machine = new StateMachine({
      graphElement: graphRef.current,
      SPOT_WIDTH,
      element: ref.current,
      onChange: (...args) => onChangeRef.current.apply(null, args)
    });

    return () => {
      machine.dispose();
    }
  }, []);
  return ref;
}
