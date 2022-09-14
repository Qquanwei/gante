import { useContext } from 'react';
import { ConnectionContext } from './RecoilSyncShareDB';
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


let globalIndex = 10;
function makeId() {
  return Math.floor(Math.random() * 1000) + 'rand' + globalIndex++;
}

export function useCreateNewNode() {
  const conRef = useContext(ConnectionContext);

  return useRecoilCallback(({ set }) => (nodeInitProperty, newPosition) => {
    const newId = makeId();
    const doc = conRef.current.get('item', newId);
    return new Promise((resolve, reject) => {
      doc.create({...nodeInitProperty, id: newId }, 'json1', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('new Position', newPosition);
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

export function useDeleteItem() {
  const conRef = useContext(ConnectionContext);
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
