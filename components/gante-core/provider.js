import React, {
  useReducer, useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle
} from 'react';
import Events from 'events';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import * as atoms from './atom';
import dayjs from 'dayjs';
import * as json1 from 'ot-json1';
import { hasProp } from './utils';

const Context = React.createContext();

export {
  Context
};


let globalIndex = 10;
function makeId() {
  return Math.floor(Math.random() * 1000) + 'rand' + globalIndex++;
}

function Provider({ children, forwardRef }) {
  const graphRef = useRef(null);
  const sinkRef = useRef(null);
  const portalRef = useRef(null);

  const event = useMemo(() => {
    return new Events();
  }, []);

  const [list, setList]= useRecoilState(atoms.list);
  const listMap = useRecoilValue(atoms.listMap);

  const swapItem = useCallback((fromPosition, toPosition) => {
    setList((list) => {
      if (list[fromPosition] && list[toPosition]) {
        // 不能用moveop, 要用setop
        const op =[
          json1.replaceOp([fromPosition], list[fromPosition], list[toPosition]),
          json1.replaceOp([toPosition], list[toPosition], list[fromPosition])
        ].reduce(json1.type.compose, null);
        event.emit('op', op);
        return json1.type.apply(list, op);
      }
      return list;
    });
  }, []);

  const updateItemDate = useCallback((id, startTime, endTime) => {
    setList((list) => {
      const index = list.findIndex(item => item.id === id);
      if (list[index].startTime === startTime && list[index].endTime === endTime) {
        return list;
      }
      const op = [
        json1.replaceOp(
          [index, 'startTime'],
          list[index].startTime,
          startTime
        ),
        json1.replaceOp(
          [index, 'endTime'],
          list[index].endTime,
          endTime
        )
      ].reduce(json1.type.compose, null);

      event.emit('op', op);
      return json1.type.apply(list, op);
    });
  }, []);

  const updateItemTitle = useCallback((id, title, remark) => {
    setList(list => {
      const index = list.findIndex(item => item.id === id);
      let op = json1.replaceOp(
        [index, 'title'],
        list[index].title,
        title
      );
      if (hasProp(list[index], 'remark')) {
        op = json1.type.compose(op, json1.replaceOp(
          [index, 'remark'],
          list[index].remark,
          remark
        ));
      } else {
        op = json1.type.compose(op, json1.insertOp(
          [index, 'remark'],
          remark
        ));
      }
      event.emit('op', op);
      return json1.type.apply(list, op);
    });
  }, []);

  const updateItemLock = useCallback((id, lock) => {
    setList(list => {
      const idx = list.findIndex(item => item.id === id);
      if (!list[idx]) {
        return list;
      }

      let op = null;
      if (hasProp(list[idx], 'lock')) {
        op = json1.replaceOp(
          [idx, 'lock'],
          list[idx].lock,
          lock
        );
      } else {
        op = json1.insertOp(
          [idx, 'lock'],
          lock
        );
      }
      event.emit('op', op);
      return json1.type.apply(list, op);
    });
  }, []);

  const updateItemConnect = useCallback((id, targetId, add  = true) => {
    const node = listMap[id];
    const target = listMap[targetId];
    if (!node || !target) {
      return;
    }
    const sourceIndex = list.indexOf(node);
    const targetIndex = list.indexOf(target);

    let op = null;

    if (add) {
      if (!node.connectTo) {
        op = json1.insertOp(
          [sourceIndex, 'connectTo'],
          [targetId]
        );
      } else {
        if (node.connectTo.indexOf(targetId) === -1) {
          op = json1.insertOp(
            [sourceIndex, 'connectTo', node.connectTo.length],
            targetId
          );
        }
      }

      if (!target.from) {
        op = json1.type.compose(op, json1.insertOp(
          [targetIndex, 'from'],
          [id]
        ));
      } else {
        op = json1.type.compose(op, json1.insertOp(
          [targetIndex, 'from', target.from.length],
          id
        ));
      }
    } else {
      if (node.connectTo && node.connectTo.indexOf(targetId) !== -1) {
        op = json1.type.compose(op, json1.removeOp(
          [sourceIndex, 'connectTo', node.connectTo.indexOf(targetId)],
          targetId
        ));
      }
      if (target && target.from && target.from.indexOf(id) !== -1) {
        op = json1.type.compose(op, json1.removeOp(
          [targetIndex, 'from', target.from.indexOf(id)],
          id
        ));
      }
    }
    event.emit('op', op);
    setList(json1.type.apply(list, op));
  }, [list]);

  const deleteItem = useCallback((id) => {
    const node = listMap[id];
    if (node) {
      const idx = list.findIndex(i => i.id === id);
      let op = null;

      if (node.connectTo) {
        node.connectTo.forEach((toId) => {
          const toNode = listMap[toId];
          if (toNode && toNode.from) {
            op = json1.type.compose(op, json1.removeOp(
              [list.indexOf(toNode), 'from', toNode.from.indexOf(node.id)],
              node.id
            ));
          }
        });
      }

      if (node.from) {
        node.from.forEach((fromId) => {
          const fromNode = listMap[fromId];
          if (fromNode && fromNode.connectTo && fromNode.connectTo.indexOf(node.id) !== -1) {
            op = json1.type.compose(op, json1.removeOp(
              [list.indexOf(fromNode), 'connectTo', fromNode.connectTo.indexOf(node.id)],
              node.id
            ));
          }
        });
      }
      // 上面的操作不会改变数组的顺序，所以先执行上面后执行会改变顺序的操作
      op = json1.type.compose(op, json1.removeOp([idx], list[idx]));
      event.emit('op', op);
      setList(json1.type.apply(list, op));
    }
  }, [list, listMap]);

  // swapIndex 创建后立即定位到指定位置
  const createNewItem = useCallback(({ title, startTime, endTime }, swapIndex) => {
    const newItem = {
      id: makeId(),
      title,
      startTime,
      endTime
    };
    const op = json1.insertOp([list.length], newItem);

    if (Number.isInteger(swapIndex)) {
      event.emit('op', op);
      setList(json1.type.apply(list, op));
      swapItem(list.length, swapIndex);
    }
  }, [list, swapItem]);

  useImperativeHandle(forwardRef, () => {
    return {
      createNewItem,
      list,
      setList,
      event
    };
  });

  const contextValue = useMemo(() => {
    return {
      graphRef,
      setList,
      sinkRef,
      swapItem,
      updateItemConnect,
      updateItemDate,
      updateItemTitle,
      updateItemLock,
      createNewItem,
      deleteItem,
    };
  }, [
    setList,
    createNewItem,
    deleteItem,
    updateItemConnect,
    updateItemTitle,
    updateItemDate
  ]);

  return (
    <Context.Provider value={contextValue}>
      { children }
    </Context.Provider>
  );
};

export default React.forwardRef(function ProviderRef(props, ref) {
  return (
    <RecoilRoot>
      <Provider {...props} forwardRef={ref} />
    </RecoilRoot>
  );
});
