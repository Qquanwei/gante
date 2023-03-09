import { parseTodoStr } from './index.js';
import dayjs from 'dayjs';

describe('agenda-panel', () => {
  describe('parseTodoStr', () => {
    const today = dayjs('Mon Mar 06 2023 19:17:39 GMT+0800 (中国标准时间)');

    it ('case1', () => {
      const todo = parseTodoStr('abc +3', today);
      expect(today.diff(todo.schedule, 'day')).toEqual(-3);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
    });

    it ('case2', () => {
      const todo = parseTodoStr('abc+3', today);
      expect(today.diff(todo.schedule, 'day')).toEqual(-3);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
    });

    it ('case3', () => {
      const todo = parseTodoStr('abc +3/7', today);
      expect(today.diff(todo.schedule, 'day')).toEqual(-3);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(7);
    });

    it ('case4', () => {
      const todo = parseTodoStr('abc +3 / 7', today);
      expect(today.diff(todo.schedule, 'day')).toEqual(-3);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(7);
    });

    it ('case5', () => {
      const todo = parseTodoStr('abc 12', today);
      // 今天是6号
      expect(today.add(6, 'day').isSame(todo.schedule, 'day')).toBe(true);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
    });

    it ('case6', () => {
      const todo = parseTodoStr('abc 5', today);
      // 今天是6号
      expect(today.set('date', 5).add(1, 'month').isSame(todo.schedule, 'day')).toBe(true);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
    });

    it ('case7', () => {
      const todo = parseTodoStr('abc5', today);
      // 今天是6号
      expect(today.set('date', 5).add(1, 'month').isSame(todo.schedule, 'day')).toBe(true);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
    });

    it ('case8', () => {
      const todo = parseTodoStr('abc5.3', today);
      // 今天是6号
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
      expect(today.set('date', 3).set('month', 5).isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case9', () => {
      const todo = parseTodoStr('abc 5.3', today);
      // 今天是6号
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
      expect(today.set('date', 3).set('month', 5).isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case10', () => {
      const todo = parseTodoStr('abc 5.3/3', today);
      // 今天是6号
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(3);
      expect(todo.deadline).toEqual('');
      expect(today.set('date', 3).set('month', 5).isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case11', () => {
      const todo = parseTodoStr('abc 5.3 / 3', today);
      // 今天是6号
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(3);
      expect(todo.deadline).toEqual('');
      expect(today.set('date', 3).set('month', 5).isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case12', () => {
      const todo = parseTodoStr('abc /3', today);
      // 今天是6号
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(3);
      expect(todo.deadline).toEqual('');
      expect(today.isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case13', () => {
      const todo = parseTodoStr('abc', today);
      // 今天是6号
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
      expect(todo.schedule).toBe('');
    });

  });
});
