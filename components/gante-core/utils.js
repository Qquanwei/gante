export function Position(x, y) {
    this.x = x;
    this.y = y;
}

export function inherit(Super, Child) {
    function NewChild() {
        Super.apply(this, arguments);
        Child.apply(this, arguments);
    }

    NewChild.prototype = Object.create(Super.prototype);

    return NewChild;
}

// 将鼠标坐标系转化成基于甘特图的坐标系
export function getPosition(graphEle, event) {
    const rect = graphEle.getBoundingClientRect();
    return new Position(
        event.pageX - rect.left,
        event.pageY - rect.top
    );
}
