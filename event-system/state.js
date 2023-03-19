import { transform } from 'lodash';
import { createEventListener, Subscription } from 'tiny-event-manager';
import { inherit, getPositionViewport, Position, getPosition } from '../components/gante-core/utils';
import parseX, { isEventMatch } from './parsex';
import * as Events from './events';

export let DragAndDropState;
export let MoveState;

export function State() {
}

State.prototype.mount = function() {
};

State.prototype.unmount = function() {
};

State.prototype.onDragStart = function() {
};

State.prototype.onDragEnd = function() {
};

State.prototype.onMouseUp = function() {
};

State.prototype.onDrop = function() {
};

State.prototype.onMouseDown = function() {
};

State.prototype.onDragOver = function() {};

State.prototype.onMouseMove = function() {};

State.prototype.onMouseDown = function() {
};

export const NormalState = inherit(State, function() {
  this.mousedown = false;
});

NormalState.prototype.onDragStart = function(e) {
  this.machine.switchState(new DragAndDropState(e));
};

NormalState.prototype.onMouseDown = function() {
  this.mousedown = true;
}
NormalState.prototype.onMouseMove = function(e) {
  if (!this.mousedown) {
    return;
  }
  let target = e.target;
  // 检测是否去移动
  while (target && target !== this.container) {
    if (target.dataset.x) {
      const configs = parseX(target.dataset.x);
      for (const config of configs) {
        if (config.eventName === 'move') {
          console.log('switch to move')
          this.machine.switchState(new MoveState(target, e));
          break;
        }
      }
    }
    target = target.parentElement;
  }
}

MoveState = inherit(State, function(target, e) {
  this.target = target;
  this.config = parseX(this.target.dataset.x).filter(config => {
    return config.eventName === 'move'
  })[0];
  this.initPosition = getPositionViewport(e);
  this.dropCallbacks = [];
  console.log(this.target)
});

MoveState.prototype.unmount = function() {
  [...this.dropCallbacks].forEach(cb => {
    cb();
  });

  this.target.parentElement.removeChild(this.cloneEle);
}
MoveState.prototype.mount = function() {
  this.target.classList.add(...this.config.className);

  this.cloneEle = this.target.cloneNode();
  this.cloneEle.id = '';
  this.target.parentElement.appendChild(this.cloneEle);


  this.dropCallbacks.push(() => {
    this.target.classList.remove(...this.config.className);
  });
}

MoveState.prototype.onMouseMove = function(e) {
  const currentPosition = getPositionViewport(e);
  const diff = currentPosition.diff(this.initPosition);
  
  let transformX = 0, transformY = 0;
  if (this.config.modify === 'x') {
    transformX = diff.x;
    transformY = 0;
  } else if (this.config.modify === 'y') {
    transformX = 0;
    transformY = diff.y;
  } else {
    transformX = diff.x;
    transformY = diff.y;
  }
  this.cloneEle.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;
  const event = new CustomEvent(Events.MOVE);
  this.target.dispatchEvent(event);
};

MoveState.prototype.onMouseUp = function() {
  this.machine.switchState(new NormalState());
};

DragAndDropState = inherit(State, function(e) {
  this.target = e.target;
  this.dropCallbacks = [];
  this.transferData = this.target.dataset.xDragData;
  e.dataTransfer.setDragImage(this.target, 10, 10);
  e.dataTransfer.setData('text/plain', this.transferData);
  e.dataTransfer.effectAllowed = "all";
  this.configs = [];
});

DragAndDropState.prototype.unmount = function() {
  this.configs.forEach(thisConfig => {
    this.target.classList.remove(...thisConfig.className);
  });
 
  // 防止 dropCallbacks 被修改
  [...this.dropCallbacks].forEach((cb) => {
    cb();
  });
};

DragAndDropState.prototype.mount = function() {
  const x = this.target.dataset.x;
  if (!x) {
    return;
  };

  const configs = this.configs = parseX(x);

  configs.forEach(config => {
    // drag event
    if (config.className) {
      this.target.classList.add(...config.className);
    }
  
    let nodes = null;
    if (config.groupName) {
      nodes = this.container.querySelectorAll(`[data-inner-${config.groupName}-drop]`);
    } else {
      nodes = this.container.querySelectorAll('[data-inner-drop]');
    }
    nodes.forEach((node) => {
      const configs = parseX(node.dataset.x);
      configs.forEach(config => {
        if (isEventMatch('drop', this.configs, config)) {
          if (config.className.length) {
            node.classList.add(...config.className);
            this.dropCallbacks.push(() => {
              node.classList.remove(...config.className);
            });
          }
        }
      });
    });
  });
};

DragAndDropState.prototype.onMouseUp = function() {
  this.machine.switchState(new NormalState());
};

DragAndDropState.prototype.onDragEnd = function() {
  this.machine.switchState(new NormalState());
};


DragAndDropState.prototype.onDragOver = function(e) {
  let target = e.target;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.effectAllowed = "copy";
  if (this.modifer) {
    return;
  }

  while (target !== this.container) {
    if (target.dataset.x) {
      const dropConfigs = parseX(target.dataset.x);
      let modifierConfig;
      if (modifierConfig = isEventMatch('dragover', this.configs, dropConfigs)) {
        target.classList.add(...modifierConfig.className);
        this.modifer = true;

        // FIXME: dragleave 会在一些缝隙触发
        const dragLeaveHandler = () => {
          this.modifer = false;
          target.classList.remove(...modifierConfig.className);
          target.removeEventListener('dragleave', dragLeaveHandler);
          const idx = this.dropCallbacks.indexOf(dragLeaveHandler);
          this.dropCallbacks.splice(idx, 1);
          console.log('drag leave',target)
        };
        this.dropCallbacks.push(dragLeaveHandler);
        target.addEventListener('dragleave', dragLeaveHandler);
        break;
      }
    }
    target = target.parentElement;
  }
};

DragAndDropState.prototype.onDrop = function(e) {
  e.stopPropagation();
  e.preventDefault();
  let eventName = null;
  this.configs.forEach((thisConfig) => {
    if (thisConfig.groupName) {
      eventName = `${thisConfig.groupName}/drop`;
    } else {
      eventName = 'drop';
    }
    const event = new CustomEvent(eventName);
    event.initCustomEvent(eventName, true, true, {
      transferData: this.transferData
    });
    let target = e.target;
    while (target && target !== this.container) {
      if (target.dataset.x) {
        if (isEventMatch('drop', this.configs, parseX(target.dataset.x))) {
          target.dispatchEvent(event);
          break;
        }
      }
      target = target.parentElement;
    }
  });
};

function StateManage(dom) {
  this.switchState(new NormalState());
  this.sub = new Subscription();
  this.container = dom;

  this.sub.add(createEventListener(dom, 'dragstart', (e) => {
    this.state.onDragStart(e);
  }));

  this.sub.add(createEventListener(dom, 'dragend', e => {
    this.state.onDragEnd(e);
  }));

  this.sub.add(createEventListener(document, 'mouseup', (e) => {
    this.state.onMouseUp(e);
  }));

  this.sub.add(createEventListener(dom, 'drop', (e) => {
    this.state.onDrop(e);
  }));

  this.sub.add(createEventListener(document, 'mousedown', e => {
    this.state.onMouseDown(e);
  }));

  this.sub.add(createEventListener(dom, 'dragover', e => {
    this.state.onDragOver(e);
  }));

  this.sub.add(createEventListener(dom, 'mousemove', e => {
    this.state.onMouseMove(e);
  }, { passive: true }));

  this.sub.add(createEventListener(dom, 'mouseup', e=> {
    this.state.onMouseUp(e);
  }));
}

StateManage.prototype.switchState = function(newState) {
  if (this.state) {
    this.state.unmount();
  }
  this.state = newState;
  this.state.machine = this;
  this.state.container = this.container;
  this.state.mount();
};

StateManage.prototype.unmount = function() {
  this.sub.unsubscribe();
};

export default StateManage;
