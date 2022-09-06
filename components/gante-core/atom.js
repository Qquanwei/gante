import { atomFamily, atom, selectorFamily, selector } from 'recoil';
import dayjs from 'dayjs';
import indexBy from 'ramda/src/indexBy';
import * as json1 from 'ot-json1';
import prop from 'ramda/src/prop';


// 每个甬道的高度
export const SINK_HEIGHT = atom({
  key: 'gante spot height',
  default: 41
});

// 每个格子的高度
export const SPOT_WIDTH = atom({
  key: 'gante spot width',
  default: 50
});

// 整个甘特图起始时间
export const startTime = atom({
  key: 'gante global starttime',
  default: dayjs(Date.now() - 30 * 24 * 60 * 60 * 1000).startOf('day')
});

// 整个甘特图结束时间
export const endTime = atom({
  key: 'gante global endtime',
  default: dayjs(Date.now() + 40 * 24 * 60 * 60 * 1000).startOf('day')
});

export const _listCore = atom({
  key: 'gante list core',
  default: {
    list: [],
    map: {}
  }
});

export const list = selector({
  key: 'gante list',
  get: ({ get }) => {
    const coreData = get(_listCore);
    return coreData.list.map(i => {
      return coreData.map[i];
    });
  },
  set: ({ set }, newValue) => {
    set(_listCore, coreData => {
      return {
        list: newValue.map(prop('id')),
        map: indexBy(prop('id'))(newValue)
      };
    });
  }
});

export const listMap = selector({
  key: 'gante list but map',
  get: ({ get }) => {
    return indexBy(prop('id'), get(list));
  }
});

export const thatNode = selectorFamily({
  key: 'gante: some node by id',
  get: (nodeId) => ({ get }) => {
    return get(listMap)[nodeId];
  },
  set: (nodeId) => ({ set }, newValue) => {
    set(_listCore, coreData => {
      return {
        ...coreData,
        map: {
          ...coreData.map,
          [nodeId]: newValue
        }
      };
    });
  }
});

// 这个节点有多少天
export const thatNodeDays = selectorFamily({
  key: 'gante: some node days',
  get: (nodeId) => ({ get }) => {
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

    return get(listMap)[get(currentNodeId)];
  }
});


// 一些全局特性开关
// 当前元素开启的辅助特性
export const currentFeatures = atom({
  key: 'gante current features',
  default: null
});
