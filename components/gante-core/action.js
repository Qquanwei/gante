import { useContext } from 'react';
import prop from 'ramda/src/prop';
import { useGetDoc } from 'recoil-sharedb';
import * as atoms from './atom';
import * as json1 from 'ot-json1';
import { useRecoilCallback } from 'recoil';

export function useUpdateItemProperty() {
  const getDoc = useGetDoc();
  return useRecoilCallback(({ set, snapshot }) => async (id, ...args) => {
    let prevK = null;
    const doc = getDoc('item', id);
    const node = await snapshot.getPromise(atoms.thatNode(id));
    let op = null;
    if (typeof args[0] === 'function') {
      return snapshot.getPromise(atoms.thatNode(id)).then((oldValue) => {
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

function makeId(listId) {
  const query = qs.parse(window.location.search.slice(1));
  return query.id + '.' + crypto.randomBytes(12).toString('hex');
}

export function useCreateNewNode() {
  const getDoc = useGetDoc();

  return useRecoilCallback(({ set, snapshot}) => (nodeInitProperty, newPosition) => {
    const newId = makeId();
    const doc = getDoc('item', newId);
    const listDoc = getDoc('list', '<docId>');

    return new Promise((resolve, reject) => {
      doc.create({...nodeInitProperty, id: newId }, 'json1', async (err) => {
        if (err) {
          reject(err);
        } else {
          const list = await snapshot.getPromise(atoms._listCore__list);
          if (!listDoc.type) {
            listDoc.create({ list: [] }, 'json1', () => {
              listDoc.submitOp(
                json1.insertOp(['list', Math.min(list.length, Math.max(newPosition - 1, 0))], newId)
              );
            });
          } else {
            listDoc.submitOp(
                json1.insertOp(['list', Math.min(list.length, Math.max(newPosition - 1, 0))], newId)
            );
          }
          resolve(doc);
        }
      });
    });
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
    doc.del();
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

import dayjs from 'dayjs';
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
      const day = payload;
      set(atoms._listCore__editor, (oldValue) => {
        return {
          ...oldValue,
          pin: [].concat(oldValue.pin || [], {
            type,
            day: payload
          })
        };
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
