import { parseTodoStr } from './index.js';
import dayjs from 'dayjs';

describe('agenda-panel', () => {
  describe('parseTodoStr', () => {
    const today = dayjs('2023 03 08');

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
      expect(dayjs('2023 03 12').isSame(todo.schedule, 'day')).toBe(true);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
    });

    it ('case6', () => {
      const todo = parseTodoStr('abc 5', today);
      expect(today.set('date', 5).add(1, 'month').isSame(todo.schedule, 'day')).toBe(true);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
    });

    it ('case7', () => {
      const todo = parseTodoStr('abc5', today);
      expect(today.set('date', 5).add(1, 'month').isSame(todo.schedule, 'day')).toBe(true);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
    });

    it ('case8', () => {
      const todo = parseTodoStr('abc5.3', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
      expect(dayjs('2023 05 03').isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case9', () => {
      const todo = parseTodoStr('abc 5.3', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
      expect(dayjs('2023 05 03').isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case10', () => {
      const todo = parseTodoStr('abc 5.3/3', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(3);
      expect(todo.deadline).toEqual('');
      expect(dayjs('2023 05 03').isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case11', () => {
      const todo = parseTodoStr('abc 5.3 / 3', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(3);
      expect(todo.deadline).toEqual('');
      expect(dayjs('2023 05 03').isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case12', () => {
      const todo = parseTodoStr('abc /3', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(3);
      expect(todo.deadline).toEqual('');
      expect(today.isSame(todo.schedule, 'day')).toBe(true);
    });

    it ('case13', () => {
      const todo = parseTodoStr('abc', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(0);
      expect(todo.deadline).toEqual('');
      expect(dayjs(todo.schedule).isSame(today, 'day')).toBe(true);
    });

    it ('case14', () => {
      const todo = parseTodoStr('abc 18/2', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(2);
      expect(todo.deadline).toEqual('');
      expect(dayjs(todo.schedule).isSame(dayjs('2023 03 18'), 'day')).toBe(true);
    });

     it ('case15', () => {
      const todo = parseTodoStr('abc 18 / 2', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(2);
      expect(todo.deadline).toEqual('');
      expect(dayjs(todo.schedule).isSame(dayjs('2023 03 18'), 'day')).toBe(true);
     });

    it ('case15', () => {
      const todo = parseTodoStr('abc 1 / 2', today);
      expect(todo.title).toEqual('abc');
      expect(todo.headline).toEqual('todo');
      expect(todo.repeat).toEqual(2);
      expect(todo.deadline).toEqual('');
      expect(dayjs(todo.schedule).isSame(dayjs('2023 04 01'), 'day')).toBe(true);
    });

  });
});
