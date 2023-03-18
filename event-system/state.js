import { createEventListener, Subscription } from 'tiny-event-manager';
import { inherit } from '../components/gante-core/utils';

function parseX(xStr) {
  let className, last, groupName, modify, eventName;
  [groupName, last] = xStr.split('/');
  if (!last) {
    groupName = null;
    last = xStr;
  }

  [last, className] = last.split(':');
  [eventName, modify] = last.split('-');

  if (className) {
    className = className.split('.');
  } else {
    className = [];
  }

  return {
    className,
    groupName,
    modify,
    eventName
  };
}

let DragAndDropState;

function State() {
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


const NormalState = inherit(State, function() {
});

NormalState.prototype.onDragStart = function(e) {
  this.machine.switchState(new DragAndDropState(e));
};

DragAndDropState = inherit(State, function(e) {
  this.target = e.target;
  this.dropCallbacks = [];
  this.transferData = this.target.dataset.xDragData;
  e.dataTransfer.setDragImage(this.target, 10, 10);
});

DragAndDropState.prototype.unmount = function() {
  if (this.config) {
    this.target.classList.remove(...this.config.className);
  }
  this.dropCallbacks.forEach((cb) => {
    cb();
  });
};

DragAndDropState.prototype.mount = function() {
  const x = this.target.dataset.x;
  if (!x) {
    return;
  };

  const config = this.config = parseX(x);

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
    const config = parseX(node.dataset.x);
    node.classList.add(...config.className);
    this.dropCallbacks.push(() => {
      node.classList.remove(...config.className);
    });
  });
};

DragAndDropState.prototype.onMouseUp = function() {
  this.machine.switchState(new NormalState());
};

DragAndDropState.prototype.onDragEnd = function() {
  this.machine.switchState(new NormalState());
};

DragAndDropState.prototype.onDrop = function(e) {
  e.stopPropagation();
  e.preventDefault();
  let eventName = null;
  if (this.config.groupName) {
    eventName = `${this.config.groupName}-drop`;
  } else {
    eventName = 'drop';
  }
  const event = new CustomEvent(eventName);
  event.initCustomEvent(eventName, true, true, {
    transferData: this.transferData
  });
  console.log('我dispatch了', event);
  e.target.dispatchEvent(event);
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
