import ReactDOM from 'react-dom';
import { Subscription, createEventListener } from 'tiny-event-manager';

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

State.prototype.onGraphMouseLeave = () => {
}

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


function StateMachine({
  ...extraProps
}, InitState) {
  for (let k in extraProps) {
    this[k] = extraProps[k];
  }

  this.onClick = (e) => {

  };

  this.onMouseDown = (e) => {

  };

  this.onMouseUp = (e) => {

  };

  this.onMouseMove = (e) => {

  };


  this.onInteractionMouseOver = (e) => {

  };

  this.onInteractionMouseLeave = (e) => {

  };

  this.subscription = new Subscription();
  this.subscription.add(
    createEventListener(this.element, 'click', (e) => {
      this.currentState.onClick(e);
    })
  );

  this.subscription.add(
    createEventListener(this.element, 'mouseover', (e) => {
      this.currentState.onMouseOver(e);
    })
  );

  this.subscription.add(
    createEventListener(this.element, 'mouseleave', (e) => {
      this.currentState.onMouseLeave(e);
    })
  );

  this.subscription.add(
    createEventListener(this.graph, 'mouseleave', (e) => {
      this.currentState.onGraphMouseLeave(e);
    })
  );

  this.subscription.add(
    createEventListener(this.element, 'mousedown', (e) => {
      this.currentState.onMouseDown(e);
    })
  );

  this.subscription.add(
    createEventListener(this.graphElement, 'interaction-mouseover', e => {
      this.currentState.onInteractionMouseOver(e);
    })
  );

  this.subscription.add(
    createEventListener(this.graphElement, 'interaction-mouseleave', e => {
      this.currentState.onInteractionMouseLeave(e);
    })
  );

  this.subscription.add(
    createEventListener(this.graphElement, 'mouseup', (e) => {
      this.currentState.onMouseUp(e);
    })
  );

  this.subscription.add(
    createEventListener(this.graphElement, 'mousemove', (e) => {
      this.currentState.onMouseMove(e);
    }, { passive: true })
  );


  this.currentState = new InitState();
  this.currentState.machine = this;
  this.currentState.mount();
}

StateMachine.prototype.dispose = function() {
  this.subscription.unsubscribe();
  this.currentState.unmount();
}

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

StateMachine.prototype.emit = function(type, args) {
  ReactDOM.unstable_batchedUpdates(() => {
    window?.performance?.mark(type + '-start');
    this.onChange(type, args);
    window?.performance?.mark(type + '-end');
    window?.performance?.measure(type, type + '-start', type + '-end');
  });
};

export {
  State
};

export default StateMachine;
