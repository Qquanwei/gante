import React, {
  useReducer, useMemo, useState, useCallback, useRef, useEffect, useImperativeHandle
} from 'react';

import indexBy from 'ramda/src/indexBy';
import prop from 'ramda/src/prop';

const Context = React.createContext();

export {
  Context
};

const STARTTIME = Date.now() - 7 * 24 * 60 * 60 * 1000;
const ENDTIME =  Date.now() + 30 * 24 * 60 * 60 * 1000;

let globalIndex = 10;
function makeId() {
  return globalIndex++;
}

function Provider({ children, forwardRef }) {
  const graphRef = useRef(null);
  const [currentId, setCurrentId] = useState(null);
  const [tempLine, setTempLine] = useState(null);

  const [list, setList] = useState(() => {
    return [
      {
        id: 1,
        title: 'there is title',
        startTime: Date.now(),
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000
      },
      {
        id: 2,
        title: 'there is title2',
        startTime: Date.now(),
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000
      },
      {
        id: 3,
        title: 'there is title3',
        startTime: Date.now(),
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000
      },
      {
        id: 4,
        title: 'there is title4',
        startTime: Date.now(),
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000
      },
      {
        id: 5,
        title: 'there is title5',
        startTime: Date.now(),
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000
      },
      {
        id: 6,
        title: 'there is title6',
        startTime: Date.now(),
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000
      },
    ];
  });

  const swapItem = useCallback((fromPosition, toPosition) => {
    setList(list => {
      const fromitem = list[fromPosition];
      const newlist = [...list];
      newlist[fromPosition] = newlist[toPosition];
      newlist[toPosition] = fromitem;
      return newlist
    });
  }, []);

  const updateItemDate = useCallback((id, startTime, endTime) => {
    setList((list) => {
      const index = list.findIndex(item => item.id === id);
      const newlist = [...list];
      newlist[index] = {
        ...newlist[index],
        startTime,
        endTime
      }
      return newlist;
    });
  }, []);

  const updateItemTitle = useCallback((id, title) => {
    setList((list) => {
      const index = list.findIndex(item => item.id === id);
      const newlist = [...list];
      newlist[index] = {
        ...newlist[index],
        title
      }
      return newlist;
    });
  }, []);

  const createNewItem = useCallback(({ title, startTime, endTime }) => {
    setList(list => list.concat({
      id: makeId(),
      title,
      startTime,
      endTime
    }));
  }, []);

  useImperativeHandle(forwardRef, () => {
    return {
      createNewItem
    };
  });

  const listMap = useMemo(() => {
    return indexBy(prop('id'), list);
  }, [list]);

  const contextValue = useMemo(() => {
    return {
      // 每个甬道的高度
      SINK_HEIGHT: 30,
      // 每个时间节点的宽度
      SPOT_WIDTH: 50,
      graphRef,
      // 开始时间
      startTime: STARTTIME,
      // 结束时间
      endTime: ENDTIME,
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
  }, [list, currentId, tempLine, listMap]);

  return (
    <Context.Provider value={contextValue}>
      { children }
    </Context.Provider>
  );
};

export default React.forwardRef((props, ref) => {
  return <Provider {...props} forwardRef={ref} />;
});
