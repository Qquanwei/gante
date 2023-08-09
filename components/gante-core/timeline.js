import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useRecoilValue, useRecoilCallback } from 'recoil';
import * as atoms from './atom';
import isBetween from 'dayjs/plugin/isBetween';
import classNames from 'classnames';
import useCurrentDate from './useCurrentDate';
import useGante from './useGante';
import * as utils from './utils';
import * as R from 'ramda';
import TimelineStatusBar from './timeline-status-bar';
import TimelineDayBar from './timeline-day-bar';
import AgendaStatusBar from './agenda-status-bar';
import * as actions from './action';
import Pin from './pin';
dayjs.extend(isBetween);

import { busy } from './use-interaction-event';

/*
  这个组件每次重绘性能开销最大，尽量减少不必要的性能开销
*/
const TimelinePerf = React.memo(({
  startTime,
  endTime,
  inRange,
  currentTime,
  todayRef,
  previewPin,
  onDragEnter,
  onDragLeave,
  onDrop,
  SPOT_WIDTH,
  getDayTitle,
  getDaySubtitle,
  pins
}) => {
  return useMemo(() => {
    let ans = [];
    const totalDays = utils.getRangeDays(startTime, endTime) + 1;
    for (let i = 0; i < totalDays ; ++i) {
      const day = startTime.add(i, 'days');
      const range = inRange(day);
      const today = day.isSame(currentTime, 'day');
      const weekend = day.day() === 6 || day.day() === 0;

      ans.push(
        <div ref={today ? todayRef : null}
             className={classNames("box-border text-[13px] shrink-0 flex-col h-10 text-center items-center flex justify-center", {
               ["bg-sky-200/75"]: range,
               ["bg-gray-300/25"]: weekend && !range,
               ["bg-sky-200/20"]: weekend && range,
               ['bg-sky-200/70']: previewPin === day.toString()
             })}
             data-day={day.toString()}
             onDragOver={e => e.preventDefault()}
             onDragEnter={onDragEnter}
             onDragLeave={onDragLeave}
             onDrop={onDrop}
             style={{
               width: SPOT_WIDTH,
             }} key={i}>
          {
            getDayTitle(startTime.add(i, 'days'), {
              showPin: !range
            })
          }
          <span className="text-xs">{ getDaySubtitle(startTime.add(i, 'day'))}</span>
        </div>
      );
    }
    return ans;
  }, [startTime, endTime, inRange, currentTime, getDaySubtitle, getDayTitle, onDrop, onDragEnter, onDragLeave, previewPin, pins]);
}, () => {
  return busy;
});

/*
   展示时间轴，横轴
 */
export default React.memo(function Timeline({ children }) {
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const list = useRecoilValue(atoms.list);
  const startTime = useRecoilValue(atoms.startTime);
  const todayRef = useRef(null);
  const endTime = useRecoilValue(atoms.endTime);
  const currentTime = useCurrentDate();
  const currentNode = useRecoilValue(atoms.currentNode);
  const showAgentInTimeline = useRecoilValue(atoms.showAgentInTimeline);
  // dayjs string
  const [previewPin, setPreviewPin] = useState(false);
  const pins = useRecoilValue(atoms.pins);

  const cachePinsMap = useMemo(() => {
    return pins.reduce((result, pin) => {
      if (pin.type === 'timeline') {
        result[dayjs(pin.day).format('YYYYMMDD')] =  pin;
        return result;
      }
      return result;
    }, {});
  }, [pins]);
  // 这一天是否有pin
  const isThisDayPin = useCallback((day) => {
    const pin = cachePinsMap[day.format('YYYYMMDD')];
    if (pin?.type === 'remove') {
      return null;
    }
    return pin;
  }, [cachePinsMap]);

  const inRange = useCallback((ts) => {
    if (!currentNode) {
      return false;
    }
    return ts.isBetween(currentNode.startTime, currentNode.endTime, 'day', '[]');
  }, [currentNode?.startTime, currentNode?.endTime]);

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

  const getDayTitle = useCallback((time, { showPin }) => {
    if (!dayjs.isDayjs(time)) {
      throw new Error('time is not dayjs instance');
    }

    const isStart = time.date() === 1;
    const pin = isThisDayPin(time);

    if (isStart) {
      return (
        <div className="font-bold relative text-orange-500 whitespace-nowrap text-[15px] px-1">
          { time.month() + 1}
          月
          { (pin) && <Pin
                       showPin={showPin}
                       dragMode="move"
                       pin={pin}
                       className="absolute top-[10px] left-[10px]" />}
        </div>
      );
    }

    let title = null;
    if (SPOT_WIDTH >= 50) {
      title = time.format('M.DD');
    } else {
      title = time.format('D');
    }
    return (
      <span className="relative">
        { title }
        {
          pin && <Pin showPin={showPin}
                      dragMode="move" pin={pin} className="absolute left-0 top-0" />
        }
      </span>
    );
  }, [SPOT_WIDTH, isThisDayPin]);

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView();
    }
  }, []);

  const onDragEnter = useCallback((e) => {
    setPreviewPin(e.currentTarget.dataset.day);
  }, []);

  const onDragLeave = useCallback((e) => {
    setPreviewPin(oldValue => {
      if (e.currentTarget && e.currentTarget.dataset.day === oldValue) {
        return null;
      }
      return oldValue;
    });
  }, []);

  const addPin = actions.useAddPin();
  const updatePin = actions.useUpdatePinContent();
  const onDrop = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const transferDataString = e.dataTransfer.getData('text/plain');

    try {
      const transferObject = JSON.parse(transferDataString);
      if (transferObject.type === 'pin') {
        if (e.currentTarget && e.currentTarget.dataset.day) {
          const pin = isThisDayPin(dayjs(e.currentTarget.dataset.day));
          if (!pin) {
            if (transferObject.pinIdx === -1) {
              addPin('timeline', e.currentTarget.dataset.day);
            } else {
              updatePin(transferObject.pinIdx, {
                day: e.currentTarget.dataset.day
              });
            }
          }
        }
      }
    } catch(e) {
      return null;
    }
  }, [isThisDayPin]);

  return (
    <div>
      <div className="sticky shadow flex flex-nowrap top-0 z-10 bg-white pb-5">
        <TimelinePerf
          todayRef={todayRef}
          previewPin={previewPin}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          getDayTitle={getDayTitle}
          getDaySubtitle={getDaySubtitle}
          pins={pins}
          SPOT_WIDTH={SPOT_WIDTH}
          startTime={startTime}
          endTime={endTime} inRange={inRange} currentTime={currentTime} />
        <TimelineStatusBar />
        <div>
          {
            showAgentInTimeline && <AgendaStatusBar />
          }
        </div>
      </div>
      <div className="relative">
        <div className="relative w-full">
          { children }
        </div>
      </div>
    </div>
  );
});
