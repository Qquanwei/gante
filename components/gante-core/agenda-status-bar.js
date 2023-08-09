import React, { useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { sortBy, groupBy, toPairs, compose, nth, filter, prop } from 'ramda';
import { useRecoilValueMemo } from 'recoil-enhance';
import { useSetRecoilState } from 'recoil';
import { headerMode } from '../header';
import * as atoms from '../gante-core/atom';

function AgendaStatusBar() {
  const setHeaderMode = useSetRecoilState(headerMode);
  const agent = useRecoilValueMemo(atoms.agent);
  const SPOT_WIDTH = useRecoilValueMemo(atoms.SPOT_WIDTH);
  const startTime = useRecoilValueMemo(atoms.startTime);
  const endTime = useRecoilValueMemo(atoms.endTime);

  // 在当前时间轴内的agent，过滤出来
  // validAgent是个pair, [dateStr, [todo1, todo2] ]
  const validAgent = useMemo(() => {
    return compose(sortBy(nth(0)), toPairs, groupBy((todo) => {
      return dayjs(todo.schedule).format('YYYY-MM-DD');
    }), filter(prop('schedule')))([...agent.todo, ...agent.done]);
  }, [agent]);

  const onClickAgenda = useCallback(() => {
    setHeaderMode(v => v !== 'agent' ? 'agent' : '');
  }, []);

  const nodes = useMemo(() => {
    let ans = [];
    let currentDay = dayjs(startTime);
    let tmpAgentList = validAgent;

    let i = 0;
    for (let i of validAgent) {
      const date = i[0];
      const diff = dayjs(date).diff(startTime, 'day');
      const todayAllDone = i[1].reduce((ans, todo) => ans && (todo.headline === 'done'), true);
      ans.push(
        <div key={i} style={{ left: SPOT_WIDTH * diff, width: SPOT_WIDTH }} className='h-[20px] absolute flex items-center justify-center'>
          <span
            onClick={onClickAgenda}
            className={classNames('text-[12px] text-white flex items-center justify-center inline-block w-[20px] h-[20px] rounded cursor-pointer hover:border-sky-300 border transition-all', {
                  ['bg-sky-300/30']: todayAllDone,
                  ['bg-red-300']: !todayAllDone
                })}>
            {i[1].length}
          </span>
        </div>
      );
    }
    return ans;
  }, [startTime, endTime, validAgent, SPOT_WIDTH, onClickAgenda]);

  if (!agent) {
    return null;
  }

  return (
    <div className="bg-gray-300 absolute left-0 right-0 top-[65px]">
      {
        nodes
      }
    </div>
  );
}

export default React.memo(AgendaStatusBar);
