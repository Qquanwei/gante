import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useRecoilValue } from 'recoil';
import * as atoms from './atom';
import isBetween from 'dayjs/plugin/isBetween';
import classNames from 'classnames';
import useCurrentDate from './useCurrentDate';
import useGante from './useGante';
import * as utils from './utils';
import * as R from 'ramda';
import TimelineStatusBar from './timeline-status-bar';
import * as actions from './action';
import Pin from './pin';
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
  const pins = useRecoilValue(atoms.pins);
  // dayjs string
  const [previewPin, setPreviewPin] = useState(false);

  // 这一天是否有pin
  const isThisDayPinIdx = useCallback((day) => {
    const idx = R.findIndex((pin) => {
      return day.isSame(pin?.day);
    }, pins);

    return idx;
  }, [pins]);

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

  const getDayTitle = useCallback((time, { showPin }) => {
    const isStart = dayjs(time).date() === 1;
    const pinIdx = isThisDayPinIdx(dayjs(time));

    if (isStart) {
      return (
        <div className="font-bold relative text-orange-500 whitespace-nowrap text-[15px] px-1">
          { dayjs(time).month() + 1}
          月
          { (pinIdx !== -1) && <Pin
                                 showPin={showPin}
                                 dragMode="move"
                                 pinIdx={pinIdx} className="absolute top-[10px] left-[10px]" />}
        </div>
      );
    }

    let title = null;
    if (SPOT_WIDTH >= 50) {
      title = dayjs(time).format('M.DD');
    } else {
      title = dayjs(time).format('D');
    }
    return (
      <span className="relative">
        { title }
        { (pinIdx !== -1) && <Pin showPin={showPin}
                               dragMode="move" pinIdx={pinIdx} className="absolute left-0 top-0" />}
      </span>
    );
  }, [SPOT_WIDTH, isThisDayPinIdx]);

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
          const idx = isThisDayPinIdx(dayjs(e.currentTarget.dataset.day));
          if (idx === -1) {
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

  }, [isThisDayPinIdx]);

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
                    getDayTitle(dayjs(startTime).add(i, 'days'), {
                      showPin: !range
                    })
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
