import { useMemo } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import useGante from './useGante';
import useCurrentDate from './useCurrentDate';
import Image from 'next/image';
/*
  timeline下方展示的一条信息bar
*/

function TimelineStatusBar() {
  const { SPOT_WIDTH,list, startTime, currentId, listMap } = useGante();

  const item = listMap[currentId];

  const left = useMemo(() => {
    if (!item) {
      return 0;
    }
    const day = moment(item.startTime).diff(moment(startTime).startOf('day'), 'days');
    return day * SPOT_WIDTH;
  }, [item, startTime]);

  const width = useMemo(() => {
    if (!item) {
      return 0;
    }
    const day = moment(item.endTime).diff(moment(item.startTime).startOf('day'), 'days');
    return (day + 1) * SPOT_WIDTH;
  }, [item, item]);

  const [totalDay] = useMemo(() => {
    if (!item) {
      return [];
    }
    // 一共多少天
    // 多少个工作日
    const totalDay = moment(item.endTime).startOf('day').diff(moment(item.startTime).startOf('day'), 'days') + 1;
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
