import { useContext } from 'react';
import prop from 'ramda/src/prop';
import { useConnectionRef } from 'recoil-sharedb';
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

// 从外部导入
export function useImportList() {
  const conRef = useConnectionRef();
  return useRecoilCallback(({ set }) => (list) => {
    // list: [{ }, { }, itemObject]
    Promise.all(
      list.map((item) => {
        return new Promise((resolve) => {
          const doc = conRef.current.get('item', item.id);
          doc.fetch(() => {
            if (doc.type) {
              resolve();
            } else {
              doc.create(item, 'json1', (error) => {
                if (error) {
                  console.log(error);
                }
                resolve();
              });
            }
          });
        });
      })
    ).then(() => {
      set(atoms._listCore__list, list.map(prop('id')));
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
  return useRecoilCallback(({ set }) => (fromIndex, toIndex) => {
    set(atoms._listCore__list, list => {
      if (list[fromIndex] && list[toIndex]) {
        const temp = list[fromIndex];
        const shallowList = [...list];
        shallowList[fromIndex] = shallowList[toIndex];
        shallowList[toIndex] = temp;
        return shallowList;
      }
      return list;
    });
  }, []);
}
