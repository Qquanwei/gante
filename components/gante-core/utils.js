export function Position(x, y) {
    this.x = x;
    this.y = y;
}

Position.prototype.diff = function(a) {
    return new Position(
        this.x - a.x,
        this.y - a.y
    );
}

/* 仅用来表示距离的程度，没有绝对意义，仅在小范围内有相对意义 */
Position.prototype.Edistance = function(a) {
  return Math.abs(this.x - a.x) + Math.abs(this.y - a.y);
}

export function inherit(Super, Child) {
    function NewChild() {
        Super.apply(this, arguments);
        Child.apply(this, arguments);
    }

    NewChild.prototype = Object.create(Super.prototype);
    NewChild.prototype.constructor = Child;
    return NewChild;
}

export const Rect = inherit(Position, function(x, y, w, h) {
  this.w = w;
  this.h = h;
});

Rect.prototype.center = function() {
  return new Position(
    this.x + this.w / 2,
    this.y + this.h / 2
  );
};

Rect.prototype.leftCenter = function() {
  return new Position(
    this.x,
    this.y + this.h / 2
  );
};

// 将鼠标坐标系转化成基于甘特图的坐标系
export function getPosition(graphEle, event) {
    const rect = graphEle.getBoundingClientRect();

    return new Position(
        event.pageX - (rect.left + window.scrollX),
        event.pageY - (rect.top + window.scrollY)
    );
}

export function getPositionViewport(event) {
  return new Position(
    event.screenX,
    event.screenY
  );
}

// 将一个元素转化成甘特图坐标系
export function getEleRect(graphEle, Ele) {
  const rect = Ele.getBoundingClientRect();
  const graphRect = graphEle.getBoundingClientRect();

  return new Rect(
    rect.left - graphRect.left,
    rect.top - graphRect.top,
    rect.width,
    rect.height
  );
}

// 将鼠标坐标转化成天数
import moment from 'moment';
export function positionToDay(SPOT_WIDTH, startTime, left, paddingFunction = Math.floor) {
  return moment(startTime).startOf('day').add(paddingFunction(left / SPOT_WIDTH), 'days');
}


export function hasProp(obj, prop) {
  return obj.hasOwnProperty(prop);
}


export function addEventOnce(target, event, callback) {
  function cb(...args) {
    if (callback) {
      callback.apply(this, args);
    }
    target.removeEventListener(event, cb);
  }
  target.addEventListener(event, cb);
}
