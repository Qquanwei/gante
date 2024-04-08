import { useRef, useEffect } from 'react';
import StateMachine, { State } from './statemachine';
import { inherit, getPositionViewport, getScrollingElement } from './utils';
import useGante from './useGante';

var NormalState = inherit(State, function () {
  this.grab = false;
});

NormalState.prototype.mount = function() {
  this.machine.element.style['cursor'] = 'grab';
}

NormalState.prototype.onMouseDown = function(e) {
  this.machine.switchMode(new GrabMode(getPositionViewport(e)));
};

NormalState.prototype.onMouseUp = function() {
}

var GrabMode = inherit(State, function(initPosition) {
  this.initPosition = initPosition;
  this.lastPosition = null;
});

GrabMode.prototype.mount = function() {
  this.machine.element.style['cursor'] = 'grabbing';
  this.scrollElement = getScrollingElement(this.machine.element);
  this.initScrollX = this.scrollElement.scrollLeft;
  this.initScrollY = this.scrollElement.scrollTop;
};

GrabMode.prototype.onMouseMove = function(e) {
  this.currentPosition = getPositionViewport(e);
  const offset = this.currentPosition.diff(this.initPosition);
  // 鼠标抖动
  this.lastPosition = this.currentPosition;
  this.scrollElement.scroll(
    Math.max(
      this.initScrollX - offset.x,
      0
    ),
    Math.max(
      this.initScrollY - offset.y,
      0
    )
  );
};
GrabMode.prototype.onGraphMouseLeave = function() {
  this.machine.switchMode(new NormalState());
}

GrabMode.prototype.onMouseUp = function() {
  this.machine.switchMode(new NormalState());
}

function useGrabEvent({ onGrab }) {
  const { graphRef } = useGante();
  const elementRef = useRef(null);
  const onGrabRef = useRef(null);

  onGrabRef.current = onGrab;

  useEffect(() => {
    const machine = new StateMachine({
      element: elementRef.current,
      graphElement: graphRef.current,
      graph: graphRef.current,
      onChange: (...args) => {
        if (onGrabRef.current) {
          return onGrabRef.current.apply(null, args);
        }
      }
    }, NormalState);

    return () => {
      machine.dispose();
    };
  }, []);

  return elementRef;

}

export default useGrabEvent;
