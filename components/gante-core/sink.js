import useGante from './useGante';
import useCurrentDate from './useCurrentDate';
import moment from 'moment';

/*
  泳道，绘制一个通道, 绘制连线
*/
export default function Sink() {
  const {
    list,
    // 一条临时的线
    tempLine,
    startTime,
    endTime,
    SINK_HEIGHT,
    SPOT_WIDTH
  } = useGante();

  const currentTime = useCurrentDate();

  const OFFSET_DAY = moment(currentTime).diff(moment(startTime), 'days');

  return (
    <svg width="100%" height="100%" style={{ height: list.length * SINK_HEIGHT}}className="pointer-events-none">
      {
        list.map((_, index) => {
          return (
            <line key={index}
                  x1={0} y1={(index + 1) * SINK_HEIGHT}
                  x2="100%" y2={(index + 1) * SINK_HEIGHT}
                  className="stroke-black stroke-1"
            />
          );
        })
      }

      {/* 当前的线 */}
      <line
        x1={SPOT_WIDTH * OFFSET_DAY + SPOT_WIDTH / 2}
        x2={SPOT_WIDTH * OFFSET_DAY + SPOT_WIDTH / 2}
        y1="0"
        y2="100%"
        className="stroke-red-500 stroke-1"
      ></line>

      {
        tempLine ? (
          <line
            className="stroke-red-500 stroke-1"
            x1={tempLine.from.x}
            y1={tempLine.from.y}
            x2={tempLine.to.x}
            y2={tempLine.to.y} />
        ) : null
      }
    </svg>
  );
}
