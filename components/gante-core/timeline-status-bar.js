import { useMemo } from 'react';
import classNames from 'classnames';
import * as utils from './utils';
import useGante from './useGante';
import useCurrentDate from './useCurrentDate';
import Image from 'next/image';
/*
  timeline下方展示的一条信息bar
*/

function TimelineStatusBar() {
  const { SPOT_WIDTH,list, startTime, currentId, listMap } = useGante();

  const item = listMap[currentId];

  const { x: left, w: width } = useMemo(() => {
    if (!item) {
      return {};
    }

    return utils.dayToRect(SPOT_WIDTH, startTime, item.startTime, item.endTime);
  }, [startTime, SPOT_WIDTH, item]);

  const [totalDay] = useMemo(() => {
    if (!item) {
      return [];
    }
    // 一共多少天
    // 多少个工作日
    const totalDay = utils.getRangeDays(item.startTime, item.endTime) + 1;
    return [totalDay];
  }, [item]);

  return (
    <div className={classNames("absolute bg-sky-200/75 items-center whitespace-nowrap text-xs bottom-0 h-5 flex justify-center border-gray-200 border-l border-r", {
           hidden: !currentId
         })} style={{
           left,
           width
         }}>
      <span className="sticky right-0 left-0">
        一共 { totalDay } 天
      </span>
    </div>
  );
}

export default TimelineStatusBar;
