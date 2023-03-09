import { useRecoilValueMemo } from 'recoil-enhance';
import { useSetRecoilState, useRecoilCallback } from 'recoil';
import classNames from 'classnames';
import dayjs from 'dayjs';
import * as json1 from 'ot-json1';
import { useCallback, useState, useMemo, Fragment } from 'react';
import { useGetDoc } from 'recoil-sharedb';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore)

import * as atoms from '../gante-core/atom';


function getNextTodo(todo) {
  if (todo.repeat !== 0 && Number.isInteger(todo.repeat)) {
    const cloneTodo = {...todo};
    cloneTodo.schedule = dayjs(todo.schedule).add(todo.repeat, 'day').toString();
    return cloneTodo;
  }
  return null;
}

function todoToStr(todo) {
  const str = todo.title;
  const sch = dayjs(todo.schedule).format('M.D');
  const repeat = todo.repeat;

  if (todo.repeat) {
    return `${str} ${sch}/${repeat}`;
  }
  return `${str} ${sch}`;
}

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
  const scheduleAndRepat = /^.*\+[0-9 ]+\/[0-9 ]+$/;
  const onlySchedule = /^.*\+\d$/;
  const onlyRepeat = /^.*\/\d$/;
  const date1 = /\d+$/;
  const date2 = /\d+\.\d+$/;
  const dateAndRepeat = /[1-9 ]+\.[0-9 ]+\/[0-9 ]+$/;

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
    const schedule = dayjs(today).set('month', Number(month.trim()) - 1)
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
  } else {
    todo.schedule = dayjs().toString();
  }
  return todo;
}

// preview 表示这是一个临时的todo
function TodoCard({ todo, className, preview }) {
  // 过期了多久
  const outdate = useMemo(() => {
    if  (todo.schedule) {
      return dayjs().diff(todo.schedule, 'day');
    }
    return 0;
  }, [todo]);

  const outdateStyle = {
    'text-stone-800': outdate > 0 && outdate < 10,
    'text-fuchsia-500': outdate >= 10 && outdate < 20,
    'text-red-500': outdate >= 20
  };

  const getDoc = useGetDoc();

  const onSetDone = useRecoilCallback(({ snapshot }) => (status = 'done') => {
    const list = snapshot.getLoadable(atoms.agent).contents;
    const idx = list.todo.indexOf(todo);
    const doc = getDoc('agent', '<docId>');

    if (status === 'done') {
      const nextTodo = getNextTodo(todo);
      const ops = [
        nextTodo ? json1.insertOp(['todo', list.todo.length], nextTodo) : null,
        todo.doneTime ? json1.replaceOp(['todo', idx, 'doneTime'], true, dayjs().toString()) : json1.insertOp(['todo', idx, 'doneTime'], dayjs().toString()),
        json1.replaceOp(['todo', idx, 'repeat'], true, 0),
        json1.replaceOp(['todo', idx, 'headline'], 'todo', 'done')
      ];
      doc.submitOp(ops.reduce(json1.type.compose, null));
    } else {
      const ops = [
        json1.replaceOp(['todo', idx, 'headline'], 'done', 'todo')
      ];
      doc.submitOp(ops.reduce(json1.type.compose, null));
    }
  }, [todo]);

  const onClickArchive = useRecoilCallback(({ snapshot }) => () => {
    const list = snapshot.getLoadable(atoms.agent).contents;
    const idx = list.todo.indexOf(todo);
    const doc = getDoc('agent', '<docId>');
    const op = json1.type.compose(
      json1.removeOp(['todo', idx]),
      json1.insertOp(['done', list.done.length], todo)
    );
    doc.submitOp(op);
  }, [todo]);

  const [editMode, setEditMode] = useState(false);
  const [iptValue, setIptValue] = useState('');

  const onClickEdit = useCallback(() => {
    setIptValue(todoToStr(todo));
    setEditMode(true);
  }, [todo]);

  const onSubmit = useRecoilCallback(({ snapshot }) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = data.get('ipt');
    const list = snapshot.getLoadable(atoms.agent).contents;
    if (value) {
      const newTodo = parseTodoStr(value, dayjs());
      const doc = getDoc('agent', '<docId>');
      const idx = list.todo.indexOf(todo);
      doc.submitOp(json1.replaceOp(['todo', idx], todo, newTodo));
      setEditMode(false);
    }
  }, [todo]);

  return (
    <div
      className={classNames("transition-all relative group mt-2 pt-2 min-h-[50px] text-[12px] flex justify-center flex-col px-2 cursor-pointer ", className, {
        'bg-gray-100': todo.headline === 'todo',
        'bg-sky-100': todo.headline === 'done'
      })}>
      {
        editMode ? (
          <form className="flex items-center" onSubmit={onSubmit}>
            <input autoFocus defaultValue={iptValue} name="ipt" className="w-full text-[12px] h-[30px] rounded my-2 px-2 border" type="text" />
            <div className="shrink-0 ml-1" onClick={() => setEditMode(false) }>取消</div>
          </form>
        ) : (
          <Fragment>
            <div className={classNames({hidden: outdate <= 0 }, outdateStyle)}>
              +{outdate}天
            </div>
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
                'text-sky-500': todo.headline === 'done'
              })}>{ todo.headline }</div>

              <div className={classNames("select-auto flex-grow py-2 font-bold h-full items-center flex", outdateStyle)}>
                { todo.title }
              </div>
            </div>

            <div className={classNames("absolute top-0 hover:bg-sky-300/70 right-0 bottom-0 w-[0px] rounded overflow-hidden bg-sky-100/50 flex items-center flex", {
              'group-hover:w-[100px] justify-around': true
            })} >
              <span className={classNames("p-1 hover:bg-gray-100 rounded", { hidden: todo.headline === 'todo'})} onClick={onClickArchive}>
                归档
              </span>
              <span className={classNames("p-1 hover:bg-gray-100 rounded", { hidden: todo.headline === 'done'})} onClick={onClickEdit}>
                编辑
              </span>
              <span
                onClick={() => onSetDone('todo')}
                className={classNames("p-1 hover:bg-gray-100 rounded", { hidden: todo.headline === 'todo'})}>
                todo
              </span>
              <span className={classNames("p-1 hover:bg-gray-100 rounded", { hidden: todo.headline === 'done'})} onClick={() => onSetDone('done')}>
                done
              </span>
            </div>
          </Fragment>
        )
      }
    </div>
  );
}

export default function AgentPanel({ className }) {
  const agent = useRecoilValueMemo(atoms.agent);
  const setAgent = useSetRecoilState(atoms.agent);
  const [confirmTodo, setConfirmTodo] = useState(null);
  const [prevIptValue, setPrevIptValue] = useState('');
  const [agendaDay, setAgendaDay] = useState('0');

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
    const today = dayjs().add(agendaDay, 'day');
    return agent.todo.filter((todo) => {
      if (!todo) {
        return false;
      }
      // 如果是查看明天的，则使用精确匹配
      if (agendaDay === '1') {
        if (!todo.schedule) {
          return false;
        }
        return dayjs(todo.schedule).isSame(today, 'day');
      }

      if (todo.headline === 'done') {
        return dayjs(todo.schedule).isSame(today, 'day') || (todo.doneTime && dayjs(todo.doneTime).isSame(today, 'day'));
      }

      if (!todo.schedule) {
        return true;
      }

      return dayjs(todo.schedule).isSameOrBefore(today, 'day');
    }, []);
  }, [agent, agendaDay]);

  const onClickAgendaDay = useCallback((e) => {
    if (e.target.dataset.day) {
      setAgendaDay(e.target.dataset.day);
    }
  }, []);

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
              <div className="whitespace-nowrap text-[12px] border border-red-500 p-2">
                <div className="text-[12px] text-red-500">再次按下回车确认</div>
                <TodoCard todo={confirmTodo} preview={true} />
              </div>
            ) : null
          }
        </form>
        <div className="flex-grow overflow-auto pb-[80px] select-none">
          <div className="text-[12px]" onClick={onClickAgendaDay}>
            <span data-day="0"
              className={classNames('cursor-pointer px-2', agendaDay === '0' ? 'text-orange-300' : 'text-gray-300')}>
              今日待办清单
            </span>
            <span
              className={classNames('cursor-pointer px-2', agendaDay === '1' ? 'text-orange-300' : 'text-gray-300')}
              data-day="1">明天</span>
            <span
              className={classNames('cursor-pointer px-2', agendaDay === '7' ? 'text-orange-300' : 'text-gray-300')}
              data-day="7">7天内所有</span>
          </div>
          {
            [...todayAgendaList].reverse().map((todo, index) => {
              return (
                <TodoCard todo={todo} key={index} className="mb-4" />
              )
            })
          }
          <div className="border-t w-full border-gray-300/50"></div>
          <div className="mt-[20px] text-[12px] text-sky-500">所有待办清单</div>
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
