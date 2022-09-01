import { useCallback } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import classNames from 'classnames';
import useCurrentDate from './useCurrentDate';
import useGante from './useGante';
import * as utils from './utils';
import TimelineStatusBar from './timeline-status-bar';

dayjs.extend(isBetween);
/*
  展示时间轴，横轴
*/
export default function Timeline({ children }) {
  const { SPOT_WIDTH,list, startTime, endTime, currentId, listMap } = useGante();
  const currentTime = useCurrentDate();

  const inRange = useCallback((ts) => {
    if (!currentId || !listMap[currentId]) {
      return false;
    }
    const currentItem = listMap[currentId];
    return ts.isBetween(currentItem.startTime, currentItem.endTime, 'day', '[]');
  }, [currentId, listMap]);

  const getDaySubtitle = useCallback((momDay) => {
    const day = momDay.day();

    if (day === 0) {
      return '周日';
    } else {
      return '周' + day;
    }
  }, []);

  return (
    <div>
      <div className="sticky shadow flex flex-nowrap top-0 z-10 bg-white pb-5">
        {
          (() => {
            let ans = [];
            const totalDays = utils.getRangeDays(startTime, endTime) + 1;
            for (let i = 0; i < totalDays ; ++i) {
              const day = dayjs(startTime).add(i, 'days');
              const range = inRange(day);
              const today = day.isSame(dayjs(currentTime), 'day');
              const weekend = day.day() === 6 || day.day() === 0;

              ans.push(
                <div className={classNames("box-border shrink-0 flex-col h-10 text-center items-center flex justify-center", {
                  ["bg-sky-200/75"]: range,
                  ["bg-gray-300/25"]: weekend && !range,
                  ["bg-sky-200/20"]: weekend && range
                })} style={{
                  width: SPOT_WIDTH,
                }} key={i}>
                  {
                    dayjs(startTime).add(i, 'days').format('M.DD')
                  }
                  <span className="text-xs">{ getDaySubtitle(dayjs(startTime).add(i, 'day'))}</span>
                </div>
              );
            }
            return ans;
          })()
        }
        <TimelineStatusBar />
      </div>
      <div className="absolute top-16 w-full">
        { children }
      </div>
    </div>
  );
}
