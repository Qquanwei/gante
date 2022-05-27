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
export function positionToDay(SPOT_WIDTH, startTime, left) {
    return moment(startTime).add(Math.ceil(left / SPOT_WIDTH), 'days');
}
