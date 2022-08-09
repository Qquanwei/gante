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

// 将鼠标坐标系转化成基于甘特图的坐标系
export function getPosition(graphEle, event) {
    const rect = graphEle.getBoundingClientRect();

    return new Position(
        event.pageX - (rect.left + window.scrollX),
        event.pageY - (rect.top + window.scrollY)
    );
}

// 将鼠标坐标转化成天数
import moment from 'moment';
export function positionToDay(SPOT_WIDTH, startTime, left, paddingFunction = Math.floor) {
  return moment(startTime).startOf('day').add(paddingFunction(left / SPOT_WIDTH), 'days');
}
