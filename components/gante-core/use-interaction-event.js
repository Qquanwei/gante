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
import { useRef, useEffect, startTransition } from 'react';
import { inherit, getPosition, hasProp, getEleRect } from './utils';
import useGante from './useGante';

// 如果 globalHoverLock = true, 表示此时全局禁用hover事件。
let globalHoverLock = false;
let globalDropLock = false;

/*
  busy 变量表示当前的操作可能很频繁，外部可以根据此标记跳过一部分重复计算，这个文件会尽量保证在busy设置为false后触发一次外部事件，通知更新
*/
export let busy = false;

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

State.prototype.onDrop = () => {
}

State.prototype.onDragEnter = () => {
}

State.prototype.onDragLeave = () => {
}

State.prototype.onDragOver = () => {};

// 当任意一个元素mouseover触发(不仅仅是自己)
State.prototype.onInteractionMouseOver = () => {
}
// 当任意一个元素mouseleave触发(同上)
State.prototype.onInteractionMouseLeave = () => {
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
  this.hover = false;
});

NormalState.prototype.mount = function() {
  const element = this.machine.getElement();
  this.leftDragger = element.querySelector('[data-role=left-dragger]');
  this.rightDragger = element.querySelector('[data-role=right-dragger]');
  this.anchor = element.querySelector('[data-role=anchor]');

  this.leftClick = (e) => {
    this.machine.switchMode(new ResizeState('left', getPosition(this.machine.getGraphElement(), e)));
  };

  this.rightClick = (e) => {
    this.machine.switchMode(new ResizeState('right', getPosition(this.machine.getGraphElement(), e)));
  };

  this.anchorClick = (e) => {
    this.machine.switchMode(new AnchorConnect(e, this.anchor));
  };

  this.leftDragger.addEventListener('mousedown', this.leftClick);
  this.rightDragger.addEventListener('mousedown', this.rightClick);
  this.anchor.addEventListener('mousedown', this.anchorClick);

  this.ignoreEventsEles = element.querySelectorAll('[data-role=ignore-events]');
}

NormalState.prototype.onDragEnter = function(event) {
  event.preventDefault();
  this.machine.emit('dragenter', event);
};

NormalState.prototype.onDragLeave = function(event) {
  this.machine.emit('dragleave', event);
};

NormalState.prototype.onDrop = function(event) {
  this.machine.emit('drop', event);
};

NormalState.prototype.onDragOver = function(event) {
  event.preventDefault();
}


NormalState.prototype.unmount = function() {
  this.leftDragger.removeEventListener('mousedown', this.leftClick);
  this.rightDragger.removeEventListener('mousedown', this.rightClick);
  this.anchor.removeEventListener('mousedown', this.anchorClick);
}

NormalState.prototype.onMouseDown = function(e) {
  for (let ignoreE of this.ignoreEventsEles) {
    if (ignoreE.contains(e.target)) {
      return;
    }
  }
  e.preventDefault();
  e.stopPropagation();
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
};

NormalState.prototype.onMouseOver = function() {
  if (!globalHoverLock && !this.hover) {
    this.hover = true;
    this.machine.emitTransition('hover', true);
  }
  const e = new CustomEvent('interaction-mouseover', {
    detail: {
      target: this.machine.getElement(),
      nodeId: this.machine.nodeId
    }
  });
  this.machine.getGraphElement().dispatchEvent(e);
};

NormalState.prototype.onMouseLeave = function() {
  if (!globalHoverLock) {
    this.machine.emitTransition('hover', false);
    this.hover = false;
  }
  const e = new CustomEvent('interaction-mouseleave', {
    detail: {
      target: this.machine.getElement()
    }
  });
  this.machine.getGraphElement().dispatchEvent(e);
}

NormalState.prototype.onMouseMove = function(e) {
  if (this.mousedown) {
    const position = getPosition(this.machine.getGraphElement(), e);
    /*
      当即将移动到一个格子的时候，进入移动状态
    */
    if (Math.abs(position.diff(this.mousePosition).x) > (this.machine.SPOT_WIDTH * 0.9)) {
      if (this.machine.enableFeature('move')) {
        this.machine.switchMode(new MoveState(this.mousePosition));
      }
    } else if (Math.abs(position.diff(this.mousePosition).y) > (this.machine.SINK_HEIGHT * 0.5) ) {
      // 如果上下移动即将超过一个甬道，则进入排序模式，排序模式不会触发左右移动
      if (this.machine.enableFeature('sort')) {
        this.machine.switchMode(new SortState(this.mousePosition));
      }
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
  this.machine.emit('lock-item', {
    lock: true
  });
  busy = true;
};

ResizeState.prototype.unmount = function() {
  globalHoverLock = false;
  busy = false;
};

ResizeState.prototype.onMouseUp = function(e) {
  this.machine.emit('lock-item', {
    lock: false,
    hover: this.machine.getElement().contains(e.target)
  });
  this.machine.switchMode(new NormalState());
};

ResizeState.prototype.onMouseMove = function(e) {
  const currentPosition = getPosition(this.machine.getGraphElement(), e);
  const { x } = currentPosition.diff(this.initPosition);
  const element = this.machine.getElement();
  if (this.mode === 'left') {
    this.machine.emitTransition('resize', {
      left: this.initLeft + x
    });
  } else {
    this.machine.emitTransition('resize', {
      width: this.initWidth + x
    });
  }
};

var MoveState = inherit(State, function(initPosition) {
  this.initPosition = initPosition;
});

MoveState.prototype.mount = function() {
  const element = this.machine.getElement();
  this.left = this.machine.getElement().offsetLeft;
  this.top = this.machine.getElement().offsetTop;
  globalHoverLock = true;

  this.ignoreEventsEles = element.querySelectorAll('[data-role=ignore-events]');
  busy = true;
  this.machine.emit('enter-move');
}

MoveState.prototype.unmount = function() {
  globalHoverLock = false;
  busy = false;
  this.machine.emit('leave-move');
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
}

MoveState.prototype.onMouseUp = function(e) {
  // 判断是否还处在的当前元素上，如果为否，则hover为false
  if (!this.machine.getElement().contains(e.target)) {
    this.machine.emitTransition('hover', false);
  }
  this.machine.switchMode(new NormalState());
};


var SortState = inherit(State, function(initPosition) {
  this.initPosition = initPosition;
});

SortState.prototype.mount = function() {
  const graph = this.machine.getGraphElement();
  const element = this.machine.getElement();
  this.clone = element.cloneNode(true);
  this.clone.id = '';
  this.clone.classList.add('z-20');
  this.clone.classList.add('opacity-50');
  this.clone.classList.add('transform-gpu');
  this.clone.classList.remove('transition-all');
  this.clone.classList.remove('duration-150');
  graph.appendChild(this.clone);
  element.classList.add('opacity-0');

  globalHoverLock = true;
  this.machine.emit('lock-item', {
    lock: true
  });

  this.machine.emit('enter-sort');

  this.lastEmitPosition = null;
  busy = true;
};

SortState.prototype.unmount = function() {
  const graph = this.machine.getGraphElement();
  graph.removeChild(this.clone);
  this.machine.getElement().classList.remove('opacity-0');
  globalHoverLock = false;
  busy = false;
  this.machine.emit('leave-sort');
};

SortState.prototype.onMouseUp = function(e) {
  this.machine.emit('lock-item', {
    lock: false,
    hover: this.machine.getElement().contains(e.target)
  });
  this.machine.switchMode(new NormalState());
}

SortState.prototype.onMouseMove = function(event) {
  const position = getPosition(this.machine.getGraphElement(), event);
  // 因为 React重绘会把清零的class重新加上，所以每次移动都要加一次classname, 这样可以创建移动元素在原位置消失并浮空出现的效果
  this.machine.getElement().classList.add('opacity-0');
  this.clone.style.top = 0;
  this.clone.style.top = position.y + 'px';

  const newEmit = Math.floor(position.y / this.machine.SINK_HEIGHT);
  if (newEmit === this.lastEmitPosition) {
    return;
  }
  this.lastEmitPosition = newEmit;
  this.machine.emitTransition('sort', {
    position
  });
}

var AnchorConnect = inherit(State, function(event, anchorEle) {
  this.initEvent = event;
  this.anchorEle = anchorEle;
});


AnchorConnect.prototype.mount = function() {
  this.initPosition = getPosition(this.machine.getGraphElement(), this.initEvent);
  this.machine.emit('lock-item', { lock: true});
  globalHoverLock = true;

  this.pointStart = getEleRect(this.machine.getGraphElement(), this.anchorEle).center();

  const graph = this.machine.getGraphElement();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  svg.setAttributeNS(null, 'class', 'absolute left-0 top-0 z-20 pointer-events-none');
  svg.setAttributeNS(null, 'width', '100%');
  svg.setAttributeNS(null, 'height', '100%');

  this.svg = svg;
  graph.appendChild(svg);

  this.path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  this.path.setAttributeNS(null, 'class', 'stroke-2 stroke-sky-500');
  this.path.setAttributeNS(null, 'fill', 'transparent');
  this.svg.appendChild(this.path);
};

AnchorConnect.prototype.unmount = function() {
  globalHoverLock = false;
  this.machine.getGraphElement().removeChild(this.svg);
};

import { connectTo } from './svgtool';
// 当自定义mouseover到别的元素上时
AnchorConnect.prototype.onInteractionMouseOver = function(e) {
  this.mouseOverEle = e.detail.target;
  this.targetNodeId = e.detail.nodeId;
  const point = getEleRect(this.machine.getGraphElement(), this.mouseOverEle).leftCenter();
  const d = connectTo(this.pointStart, point);
  this.path.setAttributeNS(null, 'd', d);
}

AnchorConnect.prototype.onInteractionMouseLeave = function() {
  this.mouseOverEle = null;
};

AnchorConnect.prototype.onMouseUp = function(e) {
  this.machine.switchMode(new NormalState());
  if (this.mouseOverEle) {
    this.machine.emit('connect', {
      targetNodeId: this.targetNodeId
    });
  }
  this.machine.emit('lock-item', {
    lock: false,
    hover: this.machine.getElement().contains(e.target)
  });
};

AnchorConnect.prototype.onMouseMove = function(event) {
  if (!this.mouseOverEle) {
    const currentPosition = getPosition(this.machine.getGraphElement(), event);
    const d = connectTo(this.pointStart, currentPosition);
    this.path.setAttributeNS(null, 'd', d);
  }
};

function StateMachine({ nodeId, element, graphElement, onChange, SPOT_WIDTH, SINK_HEIGHT }, featuresRef) {
  this.onChange = onChange;
  this.element = element;
  this.nodeId = nodeId;
  this.graphElement = graphElement;
  this.SPOT_WIDTH = SPOT_WIDTH;
  this.SINK_HEIGHT = SINK_HEIGHT;
  this.featuresRef = featuresRef;

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
  };

  this.onMouseLeave = (e) => {
    this.currentState.onMouseLeave(e);
  };

  this.onDragEnter = (e) => {
    this.currentState.onDragEnter(e);
  };

  this.onDragLeave = (e) => {
    this.currentState.onDragLeave(e);
  };

  this.onDrop = (e) => {
    this.currentState.onDrop(e);
  };

  this.onDragOver = (e) => {
    this.currentState.onDragOver(e);
  };


  this.onInteractionMouseOver = (e) => {
    this.currentState.onInteractionMouseOver(e);
  };

  this.onInteractionMouseLeave = (e) => {
    this.currentState.onInteractionMouseLeave(e);
  };

  if (this.featuresRef.drop) {
    this.element.addEventListener('dragover', this.onDragOver);
    this.element.addEventListener('dragenter', this.onDragEnter);
    this.element.addEventListener('dragleave', this.onDragLeave);
    this.element.addEventListener('drop', this.onDrop);
  }
  this.element.addEventListener('click', this.onClick);
  this.element.addEventListener('mouseover', this.onMouseOver);
  this.element.addEventListener('mouseleave', this.onMouseLeave);
  this.element.addEventListener('mousedown', this.onMouseDown);
  this.graphElement.addEventListener('interaction-mouseover', this.onInteractionMouseOver);
  this.graphElement.addEventListener('interaction-mouseleave', this.onInteractionMouseLeave);
  this.graphElement.addEventListener('mouseup', this.onMouseUp);
  this.graphElement.addEventListener('mousemove', this.onMouseMove, { passive: true });

  this.currentState = new NormalState();
  this.currentState.machine = this;
  this.currentState.mount();
}

StateMachine.prototype.dispose = function() {
  this.element.removeEventListener('dragover', this.onDragOver);
  this.element.removeEventListener('dragenter', this.onDragEnter);
  this.element.removeEventListener('dragleave', this.onDragLeave);
  this.element.removeEventListener('drop', this.onDrop);
  this.element.removeEventListener('click', this.onClick);
  this.element.removeEventListener('mouseover', this.onMouseOver);
  this.element.removeEventListener('mouseleave', this.onMouseLeave);
  this.element.removeEventListener('mousedown', this.onMouseDown);
  this.graphElement.removeEventListener('mouseup', this.onMouseUp);
  this.graphElement.removeEventListener('mousemove', this.onMouseMove, { passive: true });
  this.currentState.unmount();
}

StateMachine.prototype.getElement = function() {
  return this.element;
}

StateMachine.prototype.enableFeature = function(featureName) {
  return !hasProp(this.featuresRef.current, featureName) || (
    this.featuresRef.current[featureName]
  );
};

StateMachine.prototype.switchMode = function(newMode) {
  newMode.machine = this;
  if (this.currentState) {
    this.currentState.unmount();
  }
  newMode.mount();
  this.currentState = newMode;
};

StateMachine.prototype.getGraphElement = function() {
  return this.graphElement;
};


StateMachine.prototype.emitTransition = function(type, args) {
  startTransition(() => {
    window?.performance?.mark(type + '-start');
    this.onChange(type, args);
    window?.performance?.mark(type + '-end');
    window?.performance?.measure(type, type + '-start', type + '-end');
  });
};

StateMachine.prototype.emit = function(type, args) {
  ReactDOM.unstable_batchedUpdates(() => {
    window?.performance?.mark(type + '-start');
    this.onChange(type, args);
    window?.performance?.mark(type + '-end');
    window?.performance?.measure(type, type + '-start', type + '-end');
  });
};

const defaultFeatures = {};
import * as atoms from './atom';
import { useRecoilValue } from 'recoil';
export default function useInteractionEvent(nodeId, { onChange }, enableFeatures = defaultFeatures) {
  const ref = useRef(null);
  const featureRef = useRef(null);
  const onChangeRef = useRef(null);
  const { graphRef } = useGante();
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const SINK_HEIGHT = useRecoilValue(atoms.SINK_HEIGHT);

  onChangeRef.current = onChange;
  featureRef.current = enableFeatures;

  useEffect(() => {
    const machine = new StateMachine({
      graphElement: graphRef.current,
      nodeId,
      SPOT_WIDTH,
      SINK_HEIGHT,
      element: ref.current,
      onChange: (...args) => onChangeRef.current.apply(null, args),
    }, featureRef);

    return () => {
      machine.dispose();
    };
  }, [nodeId]);
  return ref;
}
