import * as utils from '../utils';

import dayjs from 'dayjs';
describe('utils Position', () => {
  const { Position } = utils;
  it ('should be a function', () => {
    expect(Position).toBeInstanceOf(Function);
    const p = new Position(1, 2);
    expect(p.x).toBe(1);
    expect(p.y).toBe(2);
  });

  it ('position diff', () => {
    const p = new Position(1, 2);
    const d = new Position(2, 1);
    const c = d.diff(p);
    expect(p.x).toBe(1);
    expect(p.y).toBe(2);
    expect(d.x).toBe(2);
    expect(d.y).toBe(1);
    expect(c.x).toBe(d.x - p.x);
    expect(c.y).toBe(d.y - p.y);
  });
});

describe('utils positionToDay', () => {
  const { positionToDay, Position } = utils;

  it ('should be ok', () => {
    const SPOT_WIDTH = 10;
    const startTime = Date.now();
    const left = 20;
    const paddingFunction = Math.floor;
    let day = null;

    expect(() => {
      day = positionToDay(
        SPOT_WIDTH,
        startTime,
        left,
        paddingFunction
      );
    }).not.toThrow();

    expect(day.valueOf()).toBe(startTime + 2 * 24 * 60 * 60 * 1000);
  });
});

describe('utils hasProp', () => {
  const { hasProp } = utils;

  it ('should be ok', () => {
    expect(hasProp).toBeInstanceOf(Function);

    const a = {};
    a.b = 1;
    expect(hasProp(a, 'b')).toBe(true);
    expect(hasProp(a, 'c')).toBe(false);
  });
});

describe('utils Rect', () => {
  const { Rect } = utils;

  it ('should be ok', () => {
    expect(Rect).toBeInstanceOf(Function);
    const r = new Rect(3, 0, 100, 120);
    expect(r.x).toBe(3);
    expect(r.y).toBe(0);
    expect(r.w).toBe(100);
    expect(r.h).toBe(120);
  });
});


describe('utils dayToRect', () => {
  const { dayToRect} = utils;

  it ('should be ok 不跨天', () => {
    const SPOT_WIDTH = 17;
    const startTime = dayjs(new Date('2022-08-17 15:33'));
    const dayTime = dayjs(new Date('2022-08-17 15:50'));
    const rect = dayToRect(SPOT_WIDTH, dayjs(+startTime), dayjs(+dayTime));
    expect(rect.x).toBe(0);
    expect(rect.w).toBe(SPOT_WIDTH);
  });

  it ('should be ok2 跨天', () => {
    const SPOT_WIDTH = 17;
    const startTime = dayjs(new Date('2022-08-17 15:33'));
    const dayTime = dayjs(new Date('2022-08-18 15:50'));
    const rect = dayToRect(SPOT_WIDTH, startTime, dayTime);
    expect(rect.x).toBe(SPOT_WIDTH);
    expect(rect.w).toBe(SPOT_WIDTH);
  });

  it ('should be ok3 跨天', () => {
    const SPOT_WIDTH = 17;
    const startTime = dayjs(new Date('2022-08-17 15:33'));
    const dayTime = dayjs(new Date('2022-08-18 23:59'));
    const rect = dayToRect(SPOT_WIDTH, startTime, dayTime);
    expect(rect.x).toBe(SPOT_WIDTH);
    expect(rect.w).toBe(SPOT_WIDTH);
  });

  it ('should be ok4 跨2天', () => {
    const SPOT_WIDTH = 17;
    const startTime = dayjs(new Date('2022-08-17 15:33'));
    const dayTime = dayjs(new Date('2022-08-19 00:01'));
    const rect = dayToRect(SPOT_WIDTH, startTime, dayTime);
    expect(rect.x).toBe(2 * SPOT_WIDTH);
    expect(rect.w).toBe(SPOT_WIDTH);
  });

  it ('should be ok4 跨2天,持续3天', () => {
    const SPOT_WIDTH = 17;
    const startTime = dayjs(new Date('2022-08-17 15:33'));
    const dayTime = dayjs(new Date('2022-08-19 00:01'));
    const dayEndTime = dayjs(new Date('2022-08-21 00:01'));
    const rect = dayToRect(SPOT_WIDTH, startTime, dayTime, dayEndTime);
    expect(rect.x).toBe(2 * SPOT_WIDTH);
    expect(rect.w).toBe(3 * SPOT_WIDTH);
  });
});


describe('utils getRangeDays', () => {
  const { getRangeDays } = utils;
  it ('should be ok 1', () => {
    const day1 = dayjs(new Date('2022-08-01 13:21'));
    const day2 = dayjs(new Date('2022-08-01 15:02'));
    expect(getRangeDays(day1, day2)).toBe(0);
  });

  it ('should be ok 2', () => {
    const day1 = dayjs(new Date('2022-08-01 13:21'));
    const day2 = dayjs(new Date('2022-08-02 15:02'));
    expect(getRangeDays(day1, day2)).toBe(1);
  });

  it ('should be ok 3', () => {
    const day1 = dayjs(new Date('2022-08-01 13:21'));
    const day2 = dayjs(new Date('2022-08-02 23:59'));
    expect(getRangeDays(day1, day2)).toBe(1);
  });

  it ('should be ok 4', () => {
    const day1 = dayjs(new Date('2022-08-01 23:59'));
    const day2 = dayjs(new Date('2022-08-02 00:00'));
    expect(getRangeDays(day1, day2)).toBe(1);
  });

  it ('should be ok 5', () => {
    const day1 = dayjs(new Date('2022-08-01 23:59:00'));
    const day2 = dayjs(new Date('2022-08-05 00:00:00'));

    expect(getRangeDays(day1, day2)).toBe(4);
  });
});

describe('inherit', () => {
  const { inherit } = utils;
  it ('inherit should keep which we wish [this] instance ', () => {
    function Base() {

    }
    const spy = jest.fn();
    const Child = inherit(Base, spy);
    const childInstance = new Child();
    expect(childInstance).toBeInstanceOf(Child);
    expect(spy.mock.instances).toHaveLength(1);
    expect(spy.mock.instances[0]).toEqual(childInstance);
  })
})
