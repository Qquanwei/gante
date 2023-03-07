import { useRecoilValueMemo } from 'recoil-enhance';
import { useSetRecoilState } from 'recoil';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useState, useMemo } from 'react';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore)

import * as atoms from '../gante-core/atom';


export function parseTodoStr(str, today) {
  // 分别解析以下几种情况
  /*
     1. abc +3/7 -> 三天后第一次，每7天重复一次
     2. abc +3  -> 三天后第一次，不重复
     3. abc /7  -> 每七天重复一次，今天开始
     4. abc 12.12/7 -> 12月12日第一次，每七天重复一次
     5. abc 12 -> 本月12号，或者下月12号第一次, 不重复
     6. abc 12.12 -> 12月12日开始，不重复
   */
  // DONE
  const scheduleAndRepat = /^.*\+[1-9 ]+\/[1-9 ]+$/;
  // DONE
  const onlySchedule = /^.*\+\d$/;
  const onlyRepeat = /^.*\/\d$/;
  const date1 = /\d+$/;
  const date2 = /\d+\.\d+$/;
  const dateAndRepeat = /[1-9 ]+\.[1-9 ]+\/[1-9 ]+$/;

  const todo = {
    headline: 'todo',
    title: '',
    schedule: '',
    deadline: '',
    repeat: 0,
  };

  if (scheduleAndRepat.test(str)) {
    const lastIdx = str.lastIndexOf('+');
    const lastSlashIdx = str.lastIndexOf('/');
    todo.title = str.slice(0, lastIdx).trim();
    todo.schedule = today.add(Number(str.slice(lastIdx + 1, lastSlashIdx).trim()), 'day');
    todo.repeat = Number(str.slice(lastSlashIdx + 1));
  } else if(dateAndRepeat.test(str)) {
    // pass
    const group = dateAndRepeat.exec(str);
    const [date, repeat] = group[0].split('/');
    todo.repeat = Number(repeat.trim());

    const [month, day] = date.split('.');
    const schedule = dayjs(today).set('month', Number(month.trim()))
      .set('date', Number(day.trim()));

    todo.schedule = schedule;
    todo.title = str.slice(0, group.index).trim();

  } else if (onlyRepeat.test(str)){
    const lastIdx = str.lastIndexOf('/');
    todo.title = str.slice(0, lastIdx).trim();
    todo.repeat = Number(str.slice(lastIdx + 1).trim());
    todo.schedule = today;
  } else if (onlySchedule.test(str)) {
    const lastIdx = str.lastIndexOf('+');
    const schedule = Number(str.slice(lastIdx + 1));
    todo.title = str.slice(0, lastIdx).trim();
    todo.schedule = today.add(schedule, 'day');
  }  else if (date2.test(str)) {
    const group = date2.exec(str.trim());
    const [month, day] = group[0].split('.');
    const schedule = dayjs(today).set('month', Number(month.trim()) - 1)
      .set('date', Number(day.trim()));
    todo.schedule = schedule;
    todo.title = str.slice(0, group.index).trim();
  } else if (date1.test(str)) {
    const group = date1.exec(str.trim())
    const date = Number(group[0]);
    if (today.date() > date) {
      todo.schedule = dayjs(today).add(1, 'month').set('date', date);
    } else {
      todo.schedule = dayjs(today).set('date', date);
    }
    todo.title = str.slice(0, group.index).trim();
  } else {
    todo.title = str;
  }


  if (todo.schedule) {
    todo.schedule = todo.schedule.toString();
  }
  return todo;
}

function TodoCard({ todo, className }) {
  useMemo(() => {
    //dayjs.diff(todo.schedule)
  }, []);
  return (
    <div
      className={classNames("mt-2 pt-2 min-h-[50px] text-[12px] flex justify-center flex-col bg-gray-100 px-2 cursor-pointer ", className)}>
      <div className={classNames("text-[12px] flex", { hidden: !todo.schedule })}>
        schedule: <div className="ml-2 flex-grow">{dayjs(todo?.schedule).format('YYYY-MM-DD')}</div>
      </div>
      <div className={classNames("text-[12px] flex", { hidden: !todo.deadline })}>
        deadline: <div className="ml-2 flex-grow">无</div>
      </div>
      <div className={classNames("text-[12px] flex", { hidden: !todo.repeat })}>
        重复: <div>{ todo.repeat }天</div>
      </div>
      <div className="flex items-center">
        <div className={classNames('inline-block mr-2', {
          'text-green-500': todo.headline === 'todo',
          'text-gray-500': todo.headline === 'done'
        })}>{ todo.headline }</div>

        <div className="flex-grow py-2 h-full items-center flex">
          { todo.title }
        </div>
      </div>
    </div>
  );
}

export default function AgentPanel({ className }) {
  const agent = useRecoilValueMemo(atoms.agent);
  const setAgent = useSetRecoilState(atoms.agent);
  const [confirmTodo, setConfirmTodo] = useState(null);
  const [prevIptValue, setPrevIptValue] = useState('');

  const onSubmit = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const iptValue = data.get('ipt');
    if (iptValue) {
      if (iptValue === prevIptValue) {
        // 确认添加
        form.reset();
        setConfirmTodo(null);
        setPrevIptValue('');
        setAgent(prev => {
          return {
            ...prev,
            todo: prev.todo.concat(confirmTodo)
          }
        });
      } else {
        const todo = parseTodoStr(iptValue, dayjs());
        setConfirmTodo(todo);
        setPrevIptValue(iptValue);
      }
    }
  }, [prevIptValue, confirmTodo]);

  const onChange = useCallback(() => {
    setConfirmTodo(null);
  }, []);

  const todayAgendaList = useMemo(() => {
    const today = dayjs();
    return agent.todo.filter((todo) => {
      if (!todo.schedule) {
        return true;
      }
      return dayjs(todo.schedule).isSameOrBefore(today, 'day');
    }, []);
  }, [agent.todo]);

  return (
    <div className={classNames(className, 'h-full flex flex-col')}>
      <h1 className="px-2 mt-2 text-gray-500">Daily Agenda</h1>

      <ul className="px-2 mt-4 text-gray-500 h-full flex flex-col">
        <form onSubmit={onSubmit}>
          <div className="text-[12px]">3天后待办: <span>开始阅读 +3</span></div>
          <div className="text-[12px]">10月5日待办: <span>开始阅读 10.5</span></div>
          <div className="text-[12px]">明天开始并每周重复: <span>开始阅读+1/7</span></div>
          <input placeholder="检查每日待办+1/1" name="ipt" onChange={onChange} className="w-full text-[12px] h-[30px] rounded my-2 px-2 border" type="text" />
          {
            confirmTodo ? (
              <div className="whitespace-nowrap text-[12px] border p-2">
                <div className="text-[12px] text-blue-500">再次按下回车确认</div>
                <TodoCard todo={confirmTodo} />
              </div>
            ) : null
          }
        </form>
        <div className="flex-grow overflow-auto pb-[80px] select-none">
          <div className="text-[12px] text-orange-300">
            今日待办清单
            <span className="p-2 cursor-pointer text-gray-300">明天</span>
            <span className="p-2 cursor-pointer text-gray-300">下周</span>
          </div>
          {
            [...todayAgendaList].reverse().map((todo, index) => {
              return (
                <TodoCard todo={todo} key={index} className="mb-4" />
              )
            })
          }
          <div className="mt-2 text-[12px] text-orange-300">所有待办清单</div>
          {
            [...agent.todo].reverse().map((todo, index) => {
              return (
                <TodoCard todo={todo} key={index} className="mb-4" />
              )
            })
          }
        </div>
      </ul>
    </div>
  );
}
