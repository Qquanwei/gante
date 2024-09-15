import { waitForAll, atomFamily, atom, selectorFamily, selector } from 'recoil';
import dayjs from 'dayjs';
import { effect } from 'recoil-sharedb';
import * as refine from '@recoiljs/refine';
import * as R from 'ramda';

const memoizeDayjs = R.memoizeWith(dayNum => `${dayNum}`, (dayNum: number) => {
  return dayjs(dayNum);
});

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

const todoChecker = refine.object({
  headline: refine.string(),
  title: refine.string(),
  repeat: refine.optional(refine.number()),
  schedule: refine.optional(refine.string()),
  deadTime: refine.optional(refine.string()),
  doneTime: refine.optional(refine.string())
});

export const agent = atom({
  key: 'gante_list_core_agent',
  default: {
    keyword: ['todo', 'done'],
    todo: [],
    done: [],
    archive: []
  },
  effects: [
    effect('agent', '<docId>', {
      refine: refine.object({
        keyword: refine.array(refine.string()),
        todo: refine.array(todoChecker),
        done: refine.array(todoChecker),
        archive: refine.array(todoChecker)
      })
    })
  ]
});

export const _listCore__editor = atom({
  key: 'gante_list_core_editor',
  default: {
    version: '1.0.0',
    list: [],
    pin: [],
    showAgentInTimeline: false,
    endTime: memoizeDayjs(Date.now() + 40 * 24 * 60 * 60 * 1000).startOf('day'),
    startTime: memoizeDayjs(Date.now() - 90 * 24 * 60 * 60 * 1000).startOf('day')
  },
  effects: [
    effect('list', '<docId>', {
      // 版本迁移，历史版本是一个数组，迁移到对象中
      refine: refine.match(
        refine.object({
          list: refine.array(refine.string()),
          showAgentInTimeline: refine.optional(refine.bool()),
          version: refine.optional(refine.string()),
          pin: refine.optional(refine.array(refine.object({
            type: refine.string(),
            content: refine.optional(refine.string()),
            preview: refine.optional(refine.bool()),
            day: refine.optional(refine.string()),
            nodeId: refine.optional(refine.string()),
            offset: refine.optional(refine.number()),
            fixed: refine.optional(refine.nullable(refine.string()))
          }))),
          endTime: refine.optional(refine.string()),
          startTime: refine.optional(refine.string())
        }),
        refine.asType(refine.array(refine.string()), list => ({ list }))
      ),
      syncDefault: false
    })
  ]
});

export const pins = selector({
  key: 'gante global pins',
  get: ({ get }) => {
    const list = get(_listCore__editor).pin || [];
    return list.map((item, index) => {
      return {
        ...item,
        pinIdx: index
      };
    });
  },
  set: ({ set }, newValue) => {
    return set(_listCore__editor, oldValue => ({
      ...oldValue,
      pin: newValue as any
    }));
  }
});

// 整个甘特图起始时间
// 返回的是一个dayjs对象
export const startTime = selector({
  key: 'gante global starttime',
  get: ({ get }) => {
    const def = memoizeDayjs(get(_listCore__editor).startTime);
    const cur = memoizeDayjs(Date.now() - 90 * 24 * 60 * 60 * 1000).startOf('day');

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
    const def = memoizeDayjs(get(_listCore__editor).endTime);
    const cur = memoizeDayjs(Date.now() + 40 * 24 * 60 * 60 * 1000).startOf('day');
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

export const _listCore__list = selector<string[]>({
  key: 'gante_list_core_list',
  get: ({ get }) => {
    return get(_listCore__editor).list;
  },
  set: ({ set }, newValue) => {
    set(_listCore__editor, oldValue => ({
      ...oldValue,
      list: newValue as any
    }));
  }
});

export const showAgentInTimeline = selector({
  key: 'gante: show agent in timeline',
  get: ({ get }) => {
    return get(_listCore__editor).showAgentInTimeline;
  },
  set: ({ set }, newValue) => {
    set(_listCore__editor, oldValue => ({
      ...oldValue,
      showAgentInTimeline: newValue as any
    }));
  }
});

export const thatNode = atomFamily<INode, string>({
  key: 'gante: some node by id',
  effects: (nodeKey) => {
    return [
      effect('item', nodeKey, {
        refine: refine.voidable(refine.object({
          id: refine.string(),
          type: refine.match(
            refine.string(),
            refine.asType(refine.voidable(refine.string()), () => 'node')
          ),
          segments: refine.optional(refine.array(refine.string())),
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

export const list = selector<string[]>({
  key: 'gante list',
  get: ({ get }) => {
    return get(_listCore__list);
  }
});


export const allNodes = selector<INode[]>({
  key: 'all nodes selector',
  get: ({ get }) => {
    return get(waitForAll(get(list).map(nodeId => {
      return thatNode(nodeId);
    })));
  }
});

// 这个节点有多少天
export const thatNodeDays = selectorFamily<number, string>({
  key: 'gante: some node days',
  get: (nodeId) => ({ get }) => {
    if (!nodeId) {
      return 0;
    }

    const node = get(thatNode(nodeId));

    if (!node) {
      return 0;
    }
    return memoizeDayjs(node.endTime)
      .diff(node.startTime, 'day') + 1;
  }
});

// 这个节点的宽度
export const thatNodeWidth = selectorFamily<number, string>({
  key: 'gante: some node width',
  get: (nodeId) => ({ get }) => {
    return get(thatNodeDays(nodeId)) * get(SPOT_WIDTH);
  }
});


// 这个节点相对于graph的x轴偏移量
export const thatNodeLeft = selectorFamily<number, string>({
  key: 'gante: some node left',
  get: (nodeId) => ({ get }) => {
    if (!nodeId) {
      return 0;
    }

    const node = get(thatNode(nodeId));

    if (!node) {
      return 0;
    }

    const day = memoizeDayjs(node.startTime).diff(get(startTime), 'days');
    return day * get(SPOT_WIDTH);
  }
});

export const currentNodeId = atom({
  key: 'gante current node id',
  default: null
});

/** 一个节点 */
export interface INode {
  startTime: number;
  endTime: number;
  id: string;
  type: string;
  lock: boolean;
  color?: string;
  fgcolor: string;
  connectTo?: string[],
  from?: string[]
}

export const currentNode = selector<INode>({
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


import { dayToRect, Position } from './utils';
// 当前所有的连线
export const connections = selector({
  key: 'connections',
  get: ({ get }) => {
    const list = get(_listCore__list);

    const getNodeTop = (item) => {
      return list.indexOf(item.id) * get(SINK_HEIGHT) + 3;
    };

    const nodeMap = R.indexBy(R.prop('id'), get(allNodes));

    return R.filter(v => !!v, R.flatten(get(allNodes).map((node) => {
      if (node && node.connectTo && node.connectTo.length) {
        const rect = dayToRect(get(SPOT_WIDTH), get(startTime), dayjs(node.startTime), dayjs(node.endTime));
        const left = rect.x;
        const width = rect.w;
        const top = getNodeTop(node);
        const fromPoint = new Position(
          left + width + 24,
          top + (get(SINK_HEIGHT) - 6) / 2,
        );

        const lines = node.connectTo.map((t) => {
          const tNode = nodeMap[t];

          if (!tNode) {
            return null;
          }

          const tRect = dayToRect(get(SPOT_WIDTH), get(startTime), dayjs(tNode.startTime), dayjs(tNode.endTime));
          const tLeft = tRect.x;
          const tWidth = tRect.w;
          const tTop = getNodeTop(tNode);

          const toPoint = new Position(
            tLeft,
            tTop + (get(SINK_HEIGHT) - 6) / 2
          );

          return {
            fromPoint,
            toPoint,
            node,
            tNode
          };
        });

        const identityLines = lines.filter(R.identity);
        return identityLines;
      }
      return null;
    })));
  }
});
