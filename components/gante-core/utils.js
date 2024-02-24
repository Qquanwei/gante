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

Position.prototype.add = function(a) {
  return new Position(
    this.x + a.x,
    this.y + a.y
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
  if (!graphEle) {
    return new Position(0, 0);
  }
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
import dayjs from 'dayjs';

export function positionToDay(SPOT_WIDTH, startTime, left, paddingFunction) {
  return dayjs(startTime).add((paddingFunction || Math.floor)(left / SPOT_WIDTH), 'd');
}

export function getRangeDays(startTime, endTime) {
  if (dayjs.isDayjs(startTime) && dayjs.isDayjs(endTime)) {
    return endTime.startOf('day').diff(startTime.startOf('day'), 'day');
  }
  throw new Error('startTime or endTime is not dayjs instance');
}

// x, w 为左点和长度, dayEndTime 可选，如不传则认为持续1d
// startTime is dayjs instance
export function dayToRect(SPOT_WIDTH, startTime, dayTime, dayEndTime) {
  // 因为频繁地拷贝dayjs实例会造成性能浪费
  // 本方法会高频调用，所以不放过任何一点性能优化提升的可能
  if (!dayjs.isDayjs(startTime)) {
    throw new Error('startTime is not a dayjs instance');
  }

  startTime = startTime.startOf('day');
  dayTime = dayTime.startOf('day');

  const left = dayjs(dayTime).diff(startTime, 'day') * SPOT_WIDTH;

  if (!dayEndTime) {
    return new Rect(left, 0, SPOT_WIDTH, 0);
  }

  const w = dayjs(dayEndTime)
    .diff(dayTime, 'day');
  return new Rect(left, 0, (1 + w) * SPOT_WIDTH);
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


export function getScrollingElement(element) {
  let cur = element;
  while (cur && !/scroll-container/.test(cur.dataset.role)) {
    cur = cur.parentElement;
  }
  return cur || document.scrollingElement;
}

export function throttle(fn, ms) {
  let timer = null;
  return function(...args) {
    if (timer) {
      return;
    } else {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, ms);
    }
  };
}

// 例如 -> 1, 2, 3
// 此时 1 会表现如同节流，3会表现如同防抖
// -> 1  则会发出1
// -> 1, 2 即使时间很短也会发出 1, 2
// -> 1, 2, 3, 4 , 5 会发出 1，5
// 所以这个方法应该会保证双端同步, 中间使用节流
export function bothSideThrottleAndDebounce(fn, ms) {
  let timer = null;
  let lastSend = null;

  function bs(...args) {
    lastSend = args;
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
        if (lastSend !== args && lastSend !== null) {
          bs.apply(this, lastSend);
          lastSend = null;
        }
      }, ms);
    }
  }

  return bs;
}
