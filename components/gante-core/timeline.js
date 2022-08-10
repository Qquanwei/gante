import { useCallback } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import useCurrentDate from './useCurrentDate';
import useGante from './useGante';
import TimelineStatusBar from './timeline-status-bar';
/*
  展示时间轴，横轴
*/
export default function Timeline({ children }) {
  const { SPOT_WIDTH,list, startTime, endTime, currentId, listMap } = useGante();
  const currentTime = useCurrentDate();

  const START = moment(startTime);
  const END = moment(endTime);

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
    <div className="relative">
      <div className="sticky shadow flex flex-nowrap top-0 z-10 bg-white pb-5">
        {
          (() => {
            let ans = [];
            for (let i = 0; i < END.diff(START, 'days'); ++i) {
              const day = moment(startTime).add(i, 'days');
              const range = inRange(day);
              const today = day.isSame(moment(currentTime), 'day');
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
                    moment(startTime).add(i, 'days').format('M.DD')
                  }
                  <span className="text-xs">{ getDaySubtitle(moment(startTime).add(i, 'day'))}</span>
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
