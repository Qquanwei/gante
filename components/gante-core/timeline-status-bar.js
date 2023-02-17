import { useMemo } from 'react';
import classNames from 'classnames';
import * as utils from './utils';
import useGante from './useGante';
import * as atoms from './atom';
import { useRecoilValueMemo as useRecoilValue } from 'recoil-enhance';
import Image from 'next/image';
/*
   timeline下方展示的一条信息bar
 */

function TimelineStatusBar() {
  const SPOT_WIDTH = useRecoilValue(atoms.SPOT_WIDTH);
  const startTime = useRecoilValue(atoms.startTime);
  const item = useRecoilValue(atoms.currentNode);

  const left = useRecoilValue(atoms.thatNodeLeft(item?.id));
  const width = useRecoilValue(atoms.thatNodeWidth(item?.id));
  const days = useRecoilValue(atoms.thatNodeDays(item?.id));

  const [totalDay] = useMemo(() => {
    if (!item) {
      return [];
    }
    // 一共多少天
    // 多少个工作日
    const totalDay = days;
    return [totalDay];
  }, [item, days]);

  return (
    <div className={classNames("absolute bg-sky-200/75 items-center whitespace-nowrap text-xs bottom-0 h-5 flex justify-center border-gray-200 border-l border-r", {
      hidden: !item
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
