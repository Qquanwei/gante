import { atomFamily, atom, selectorFamily, selector } from 'recoil';
import dayjs from 'dayjs';
import indexBy from 'ramda/src/indexBy';
import * as json1 from 'ot-json1';
import prop from 'ramda/src/prop';
import { effect } from 'recoil-sharedb';
import { syncEffect } from 'recoil-sync';
import * as refine from '@recoiljs/refine';

export const user = atom({
  key: 'current user',
  default: null
});

// 每个甬道的高度
export const SINK_HEIGHT = atom({
  key: 'gante spot height',
  default: 41
});

// 每个格子的高度
export const SPOT_WIDTH = atom({
  key: 'gante spot width',
  default: 40
});



export const _listCore__editor = atom({
  key: 'gante_list_core_editor',
  default: {
    version: '1.0.0',
    list: [],
    pin: [],
    endTime: dayjs(Date.now() + 40 * 24 * 60 * 60 * 1000).startOf('day'),
    startTime:  dayjs(Date.now() - 90 * 24 * 60 * 60 * 1000).startOf('day')
  },
  effects: [
    effect('list', '<docId>', {
      // 版本迁移，历史版本是一个数组，迁移到对象中
      refine: refine.match(
        refine.object({
          list: refine.array(refine.string()),
          version: refine.optional(refine.string()),
          pin: refine.optional(refine.array(refine.object({}))),
          endTime: refine.optional(refine.string()),
          startTime: refine.optional(refine.string())
        }),
        refine.asType(refine.array(refine.string()), list => ({ list }))
      ),
      syncDefault: false
    })
  ]
});

// 整个甘特图起始时间
export const startTime = selector({
  key: 'gante global starttime',
  get: ({ get }) => {
    const def = dayjs(get(_listCore__editor).startTime);
    const cur = dayjs(Date.now() - 90 * 24 * 60 * 60 * 1000).startOf('day');
    if (def.isBefore(cur)) {
      return def;
    }
    return cur;
  },
  set: ({ set }, newValue) => {
    set(_listCore__editor, oldValue => ({
      ...oldValue,
      startTime: newValue.toString()
    }));
  }
});

// 整个甘特图结束时间
export const endTime = selector({
  key: 'gante global endtime',
  get: ({ get }) => {
    const def = dayjs(get(_listCore__editor).endTime);
    const cur = dayjs(Date.now() + 40 * 24 * 60 * 60 * 1000).startOf('day');
    if (def.isBefore(cur)) {
      return cur;
    }
    return def;
  },
  set: ({ set }, newValue) => {
    set(_listCore__editor, oldValue => ({
      ...oldValue,
      endTime: newValue.toString()
    }));
  }
});

export const _listCore__list = selector({
  key: 'gante_list_core_list',
  get: ({ get }) => {
    return get(_listCore__editor).list;
  },
  set: ({ set }, newValue) => {
    set(_listCore__editor, oldValue => ({
      ...oldValue,
      list: newValue
    }));
  }
});

export const thatNode = atomFamily({
  key: 'gante: some node by id',
  effects: (nodeKey) => {
    return [
      effect('item', nodeKey, {
        refine: refine.voidable(refine.object({
          id: refine.string(),
          type: refine.match(
            refine.string(),
            refine.asType(refine.voidable(), () => 'node')
          ),
          segments: refine.optional(refine.array()),
          remark: refine.optional(refine.string()),
          lock: refine.optional(refine.bool()),
          title: refine.optional(refine.string()),
          startTime: refine.number(),
          endTime: refine.number(),
          color: refine.optional(refine.string()),
          fgcolor: refine.optional(refine.string()),
          connectTo: refine.optional(refine.array(refine.nullable(refine.string()))),
          from: refine.optional(refine.array(refine.nullable(refine.string())))
        }))
      })
    ];
  }
});

export const list = selector({
  key: 'gante list',
  get: ({ get }) => {
    return get(_listCore__list);
  },
  set: ({ set }, newValue) => {
    set(_listCore__list, newValue.map(prop('id')));
  }
});


export const allNodes = selector({
  key: 'all nodes selector',
  get: ({ get }) => {
    return get(list).map(nodeId => {
      return get(thatNode(nodeId));
    });
  }
});

// 这个节点有多少天
export const thatNodeDays = selectorFamily({
  key: 'gante: some node days',
  get: (nodeId) => ({ get }) => {
    if (!nodeId) {
      return 0;
    }

    const node = get(thatNode(nodeId));

    if (!node) {
      return 0;
    }
    return dayjs(node.endTime).startOf('dayjs')
      .diff(dayjs(node.startTime).startOf('day'), 'd') + 1;
  }
});

// 这个节点的宽度
export const thatNodeWidth = selectorFamily({
  key: 'gante: some node width',
  get: (nodeId) => ({ get }) => {
    return get(thatNodeDays(nodeId)) * get(SPOT_WIDTH);
  }
});

// 这个节点相对于graph的x轴偏移量
export const thatNodeLeft = selectorFamily({
  key: 'gante: some node left',
  get: (nodeId) => ({ get }) => {
    if (!nodeId) {
      return 0;
    }

    const node = get(thatNode(nodeId));

    if (!node) {
      return 0;
    }

    const day = dayjs(node.startTime).diff(dayjs(get(startTime)).startOf('day'), 'days');
    return day * get(SPOT_WIDTH);
  }
});

export const currentNodeId = atom({
  key: 'gante current node id',
  default: null
});

export const currentNode = selector({
  key: 'gante current node',
  get: ({ get }) => {
    if (get(currentNodeId)) {
      return get(thatNode(get(currentNodeId)));
    }
    return null;
  }
});


// 一些全局特性开关
// 当前元素开启的辅助特性
export const currentFeatures = atom({
  key: 'gante current features',
  default: null
});
