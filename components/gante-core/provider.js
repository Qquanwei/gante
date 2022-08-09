import React, {
  useReducer, useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle
} from 'react';
import Events from 'events';
import indexBy from 'ramda/src/indexBy';
import moment from 'moment';
import * as json1 from 'ot-json1';
import prop from 'ramda/src/prop';

const Context = React.createContext();

export {
  Context
};

const STARTTIME = Date.now() - 7 * 24 * 60 * 60 * 1000;
const ENDTIME =  Date.now() + 40 * 24 * 60 * 60 * 1000;

let globalIndex = 10;
function makeId() {
  return Math.floor(Math.random() * 1000) + 'rand' + globalIndex++;
}

function Provider({ children, forwardRef }) {
  const graphRef = useRef(null);
  const [currentId, setCurrentId] = useState(null);
  const [tempLine, setTempLine] = useState(null);

  const event = useMemo(() => {
    return new Events();
  }, []);

  const [list, setList] = useState([]);

  const swapItem = useCallback((fromPosition, toPosition) => {
    setList(list => {
      const fromitem = list[fromPosition];
      const newlist = [...list];
      newlist[fromPosition] = newlist[toPosition];
      newlist[toPosition] = fromitem;
      return newlist;
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

  const updateItemTitle = useCallback((id, title) => {
    const index = list.findIndex(item => item.id === id);
    const op = json1.replaceOp(
      [index, 'title'],
      list[index].title,
      title
    );
    event.emit('op', op);
    setList(json1.type.apply(list, op));
  }, [list]);

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

  const listMap = useMemo(() => {
    return indexBy(prop('id'), list);
  }, [list]);

  const contextValue = useMemo(() => {
    return {
      // 每个甬道的高度
      SINK_HEIGHT: 32,
      // 每个时间节点的宽度
      SPOT_WIDTH: 50,
      graphRef,
      // 开始时间
      startTime: moment(STARTTIME).startOf('day'),
      // 结束时间
      endTime: moment(ENDTIME).startOf('day'),
      swapItem,
      currentId,
      updateItemDate,
      updateItemTitle,
      setCurrentId,
      tempLine,
      setTempLine,
      list,
      listMap
    };
  }, [list, currentId, tempLine, listMap, updateItemTitle, updateItemDate]);

  return (
    <Context.Provider value={contextValue}>
      { children }
    </Context.Provider>
  );
};

export default React.forwardRef((props, ref) => {
  return <Provider {...props} forwardRef={ref} />;
});
