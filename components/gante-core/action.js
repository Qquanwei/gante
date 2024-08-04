import { useGetDoc } from 'recoil-sharedb';
import * as atoms from './atom';
import * as json1 from 'ot-json1';
import { useRecoilCallback } from 'recoil';

export function useUpdateItemProperty() {
  const getDoc = useGetDoc();
  return useRecoilCallback(({ snapshot }) => async (id, ...args) => {
    let prevK = null;
    const doc = getDoc('item', id);
    const node = await snapshot.getPromise(atoms.thatNode(id));
    let op = null;
    if (typeof args[0] === 'function') {
      return snapshot.getPromise(atoms.thatNode(id)).then((oldValue) => {
        // ? 异常情况
        const newArgs = args[0](oldValue, doc);
      });
    }

    for (let i = 0; i < args.length; ++i) {
      if (prevK === null) {
        prevK = args[i];
      } else {
        if (!op) {
          op = json1.replaceOp([prevK], node[prevK], args[i]);
        } else {
          op = json1.type.compose(op, json1.replaceOp([prevK], node[prevK], args[i]));
        }
        prevK = null;
      }
    }
    doc.submitOp(op);
  }, []);
}

import crypto from 'crypto';
import qs from 'qs';

function makeId() {
  const query = qs.parse(window.location.search.slice(1));
  return query.id + '.' + crypto.randomBytes(12).toString('hex');
}

export function useCreateNewNode() {
  const getDoc = useGetDoc();

  return useRecoilCallback(({ snapshot}) => (nodeInitProperty, newPosition) => {
    const newId = makeId();
    const doc = getDoc('item', newId);
    const listDoc = getDoc('list', '<docId>');
    // 历史版本开始，目前以废弃:
    // 首先，在远端创建node
    // 创建成功后，在本地更新list_id
    // 更新list_id后，本地会自动拉取并监听远端nodeid
    // 相当于饶了一圈后，再拉取本地
    // 创建操作，不会发生冲突，所以即便先本地创建，再远端生成，也无关紧要。（最坏情况，本地创建后，远端失败，此时会有回退操作。只有网络失败、id冲突才会发生。由于id使用随机数生成，所以id 冲突很少会出现）
    // 当网络失败后会发生回退.
    // 历史版本结束

    // 新版本
    // 修复了上述问题，以localfirst优先，即便是本地突然断网也不会创建失败。
    return (async () => {
      // 本地提交数据
      // local first
      doc.create({...nodeInitProperty, id: newId }, 'json1');
      // 本地提交数据
      const list = await snapshot.getPromise(atoms._listCore__list);
      if (!listDoc.type) {
        // local first
        listDoc.create({ list: []}, 'json1');
        listDoc.submitOp(
          json1.insertOp(['list', Math.min(list.length, Math.max(newPosition - 1, 0))], newId)
        );
      } else {
        listDoc.submitOp(
            json1.insertOp(['list', Math.min(list.length, Math.max(newPosition - 1, 0))], newId)
        );
      }
      return doc;
    })();
  }, []);
}

// 导出到json
export function useExportList() {
  return useRecoilCallback(({ snapshot }) => () => {
  }, []);
}

import * as R from 'ramda';

export function useDeleteItem() {
  const getDoc = useGetDoc();
  return useRecoilCallback(({ set, snapshot }) => async (nodeId) => {
    const doc = getDoc('item', nodeId);
    const listDoc = getDoc('list', '<docId>');
    const editor = await snapshot.getPromise(atoms._listCore__editor);
    const allNodes = await snapshot.getPromise(atoms.allNodes);

    allNodes.map((n) => {
      if (R.includes(nodeId, n.connectTo || [])) {
        const doc = getDoc('item', n.id);
        const removeIdx = n.connectTo.indexOf(nodeId);
        doc.submitOp(json1.removeOp(['connectTo', removeIdx], nodeId));
      }
    });

    const removeIdx = editor.list.indexOf(nodeId);
    const op = json1.removeOp(['list', removeIdx], nodeId);
    listDoc.submitOp(op);
  }, []);
}


export function useSwapItem() {
  const getDoc = useGetDoc();
  return useRecoilCallback(({ snapshot }) => (fromIndex, toIndex) => {
    const listDoc = getDoc('list', '<docId>');
    const list = snapshot.getLoadable(atoms._listCore__list).contents;
    if (list[fromIndex] && list[toIndex]) {
      listDoc.submitOp(json1.moveOp(['list', fromIndex], ['list', toIndex]));
    }
  }, []);
}

export function useEnlargeEditor() {
  return useRecoilCallback(({ set }) => (type) => {
    if (type === 'right') {
      set(atoms.endTime, (oldValue) => {
        return oldValue.add(15, 'day');
      });
    }
    if (type === 'left') {
      set(atoms.startTime, (oldValue) => {
        return oldValue.subtract(15, 'day');
      });
    }
  }, []);
}

export function useAddPin() {
  return useRecoilCallback(({ set }) => (type, payload) => {
    if (type === 'timeline') {
      set(atoms._listCore__editor, (oldValue) => {
        // 这里先判断有没有类型为remove类型的，然后再复用，省去插入成本
        const idx = (oldValue.pin||[]).findIndex(v => v.type === 'remove');
        if (idx != -1) {
          const oldPin = [...oldValue.pin];
          oldPin[idx] = {
            type,
            day: payload
          };
          return {
            ...oldValue,
            pin: oldPin
          };
        } else {
          return {
            ...oldValue,
            pin: [].concat(oldValue.pin || [], {
              type,
              day: payload
            })
          };
        }
      });
    }
    if (type === 'node') {
      const property = payload;
      set(atoms._listCore__editor, (oldValue) => {
        return {
          ...oldValue,
          pin: [].concat(oldValue.pin || [], {
            ...property,
            type
          })
        };
      });
    }
  }, []);
}


export function useUpdatePinContent() {
  return useRecoilCallback(({ set }) => (pinIdx, pinProperty) => {
    set(atoms.pins, oldPinList => {
      if (oldPinList && Array.isArray(oldPinList)) {
        if (pinIdx >= 0 && pinIdx <= oldPinList.length) {
          const copyOldPinList = [...oldPinList];
          copyOldPinList[pinIdx] = {
            ...copyOldPinList[pinIdx],
            ...pinProperty
          };
          return copyOldPinList;
        }
        return oldPinList;
      } else {
        return oldPinList;
      }
    });
  }, []);
}


export function useRemovePin() {
  return useRecoilCallback(({ set }) => (pinIdx) => {
    set(atoms.pins, oldPinList => {
      if (pinIdx >=0 && pinIdx < oldPinList.length) {
        const newPinList = [...oldPinList];
        newPinList[pinIdx] = {
          type: 'remove'
        };
        return newPinList;
      }
      return oldPinList;
    });
  }, []);
}
