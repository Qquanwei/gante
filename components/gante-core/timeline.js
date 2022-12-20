import { useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useRecoilValue } from 'recoil';
import * as atoms from './atom';
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
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const list = useRecoilValue(atoms.list);
  const currentNode = useRecoilValue(atoms.currentNode);
  const startTime = useRecoilValue(atoms.startTime);
  const todayRef = useRef(null);
  const endTime = useRecoilValue(atoms.endTime);
  const currentTime = useCurrentDate();

  const inRange = useCallback((ts) => {
    if (!currentNode) {
      return false;
    }
    return ts.isBetween(currentNode.startTime, currentNode.endTime, 'day', '[]');
  }, [currentNode]);

  const getDaySubtitle = useCallback((momDay) => {
    const day = momDay.day();

    if (SPOT_WIDTH < 30) {
      if (day === 0) {
        return '日';
      }
      return day;
    }

    if (day === 0) {
      return '周日';
    } else {
      return '周' + day;
    }
  }, [SPOT_WIDTH]);

  const getDayTitle = useCallback((time) => {
    const isStart = dayjs(time).date() === 1;

    if (isStart) {
      return (
          <div className="font-bold text-orange-500 whitespace-nowrap text-[15px] px-1">{ dayjs(time).month() + 1}月</div>
      );
    }

    let title = null;
    if (SPOT_WIDTH >= 50) {
      title = dayjs(time).format('M.DD');
    } else {
      title = dayjs(time).format('D');
    }
    return title;
  }, [SPOT_WIDTH]);

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView();
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
                <div ref={today ? todayRef : null} className={classNames("box-border text-[13px] shrink-0 flex-col h-10 text-center items-center flex justify-center", {
                  ["bg-sky-200/75"]: range,
                  ["bg-gray-300/25"]: weekend && !range,
                  ["bg-sky-200/20"]: weekend && range
                })} style={{
                  width: SPOT_WIDTH,
                }} key={i}>
                  {
                    getDayTitle(dayjs(startTime).add(i, 'days'))
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
      <div className="relative">
        <div className="relative w-full">
          { children }
        </div>
      </div>
    </div>
  );
}
