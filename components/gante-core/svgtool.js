import Path from 'svg-path-generator';
export function connectTo(fromPosition, toPosition) {
  if (toPosition.x < fromPosition.x) {
    const path = Path().moveTo(fromPosition.x, fromPosition.y)
          .verticalLineTo(fromPosition.y + (toPosition.y - fromPosition.y) / 3 )
          .horizontalLineTo(toPosition.x - 30)
          .verticalLineTo(toPosition.y)
          .horizontalLineTo(toPosition.x)
          .end();

    return path;
  } else {
    const path = Path().moveTo(fromPosition.x, fromPosition.y)
          .horizontalLineTo(toPosition.x - 30)
          .verticalLineTo(toPosition.y)
          .horizontalLineTo(toPosition.x)
          .end();
    return path;
  }
}
