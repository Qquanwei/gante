import * as atoms from './atom';
import { useRecoilCallback } from 'recoil';

export function useUpdateItemProperty() {
  return useRecoilCallback(({ set }) => (id, ...args) => {
    let prevK = null;
    const prop = {};
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
  }, []);
}
