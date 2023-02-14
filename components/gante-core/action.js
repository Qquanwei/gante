import { useContext } from 'react';
import prop from 'ramda/src/prop';
import { buildItemKey, useConnectionRef, useArraySwap } from 'recoil-sharedb';
import * as atoms from './atom';
import { useRecoilCallback } from 'recoil';

export function useUpdateItemProperty() {
  return useRecoilCallback(({ set }) => (id, ...args) => {
    let prevK = null;
    const prop = {};

    if (args.length > 1 || typeof args[0] !== 'function') {
      for (let i = 0; i < args.length; ++i) {
        if (prevK === null) {
          prevK = args[i];
        } else {
          prop[prevK] = args[i];
          prevK = null;
        }
      }
      set(atoms.thatNode(id), value => ({
        ...value,
        ...prop
      }));
    } else {
      // args[0] is function
      set(atoms.thatNode(id), value => args[0](value));
    }
  }, []);
}


function makeId() {
  return Math.floor(Math.random() * 10000000) + 'rand';
}

export function useCreateNewNode() {
  const conRef = useConnectionRef();

  return useRecoilCallback(({ set }) => (nodeInitProperty, newPosition) => {
    const newId = makeId();
    const doc = conRef.current.get('item', newId);
    return new Promise((resolve, reject) => {
      doc.create({...nodeInitProperty, id: newId }, 'json1', (err) => {
        if (err) {
          reject(err);
        } else {
          set(atoms._listCore__list, list => {
            if (newPosition >= list.length) {
              return list.concat(newId);
            }
            const a = [...list];
            a.splice(newPosition - 1, 0, newId);
            return a;
          });
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

export function useDeleteItem() {
  const conRef = useConnectionRef();
  return useRecoilCallback(({ set }) => (nodeId) => {
    const doc = conRef.current.get('item', nodeId);
    set(atoms._listCore__list, list => {
      return list.filter(v => v !== nodeId);
    });
    doc.del();
  }, []);
}


export function useSwapItem() {
  const arraySwap = useArraySwap();
  return useRecoilCallback(({ snapshot }) => (fromIndex, toIndex) => {
    const list = snapshot.getLoadable(atoms._listCore__list).contents;
    if (list[fromIndex] && list[toIndex]) {
      arraySwap(buildItemKey('list', '<docId>'), ['list', fromIndex], ['list', toIndex]);
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

import * as R from 'ramda';
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
