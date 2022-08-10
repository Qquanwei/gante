import React, {
  useReducer, useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle
} from 'react';
import Events from 'events';
import indexBy from 'ramda/src/indexBy';
import moment from 'moment';
import * as json1 from 'ot-json1';
import prop from 'ramda/src/prop';
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
  const [STARTTIME, setSTARTTIME] = useState(() => {
    return Date.now() - 7 * 24 * 60 * 60 * 1000;
  });
  const [ENDTIME, setENDTIME] =  useState(() => {
    return Date.now() + 40 * 24 * 60 * 60 * 1000;
  });

  const graphRef = useRef(null);
  const portalRef = useRef(null);
  const [currentId, setCurrentId] = useState(null);
  // 当前元素开启的辅助特性
  const [currentFeatures, setCurrentFeatures] = useState(null);

  const event = useMemo(() => {
    return new Events();
  }, []);

  const [list, setList] = useState([]);

  const listMap = useMemo(() => {
    return indexBy(prop('id'), list);
  }, [list]);


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
    event.emit('op', op);
    setList(json1.type.apply(list, op));
  }, [list]);

  const updateItemColor = useCallback((id, bgcolor, fgcolor) => {
    const index = list.findIndex(item => item.id === id);
    let op = null;
    if (list[index].color) {
      op = [
        json1.replaceOp(
          [index, 'color'],
          list[index].color,
          bgcolor
        ),
        json1.replaceOp(
          [index, 'fgcolor'],
          list[index].fgcolor,
          fgcolor
        )
      ].reduce(json1.type.compose, null);
    } else {
      op = [
        json1.insertOp(
          [index, 'color'],
          bgcolor
        ),
        json1.insertOp(
          [index, 'fgcolor'],
          fgcolor
        )
      ].reduce(json1.type.compose, null);
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

  const createNewItem = useCallback(({ title, startTime, endTime }) => {
    const newItem = {
      id: makeId(),
      title,
      startTime,
      endTime
    };
    const op = json1.insertOp([list.length], newItem);
    event.emit('op', op);
    setList(json1.type.apply(list, op));
  }, [list]);

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
      // 每个甬道的高度
      SINK_HEIGHT: 32,
      // 每个时间节点的宽度
      SPOT_WIDTH: 50,
      graphRef,
      portalRef,
      // 开始时间
      startTime: moment(STARTTIME).startOf('day'),
      // 结束时间
      endTime: moment(ENDTIME).startOf('day'),
      swapItem,
      currentId,
      updateItemConnect,
      updateItemDate,
      updateItemTitle,
      updateItemLock,
      deleteItem,
      updateItemColor,
      setCurrentId,
      list,
      listMap,
      currentFeatures,
      setCurrentFeatures
    };
  }, [
    list,
    currentFeatures,
    setCurrentFeatures,
    currentId,
    deleteItem,
    updateItemConnect,
    updateItemColor,
    listMap,
    updateItemTitle,
    updateItemDate
  ]);

  return (
    <Context.Provider value={contextValue}>
      { children }
    </Context.Provider>
  );
};

export default React.forwardRef((props, ref) => {
  return <Provider {...props} forwardRef={ref} />;
});
