import React, {
    useReducer, useMemo, useState, useCallback, useRef
} from 'react';

const Context = React.createContext();

export {
    Context
};

export default function Provider({ children }) {
    const graphRef = useRef(null);
    const [currentId, setCurrentId] = useState(null);
    const [tempLine, setTempLine] = useState(null);

    const [list, setList] = useState([
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
    ]);

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

    const contextValue = useMemo(() => {
        return {
            // 每个甬道的高度
            SINK_HEIGHT: 30,
            // 每个时间节点的宽度
            SPOT_WIDTH: 30,
            // todolist的宽度
            TODOLIST_WIDTH: 200,
            graphRef,
            // 开始时间
            startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
            // 结束时间
            endTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
            swapItem,
            currentId,
            updateItemDate,
            updateItemTitle,
            setCurrentId,
            tempLine,
            setTempLine,
            list,
        };
    }, [list, currentId, tempLine]);

    return (
        <Context.Provider value={contextValue}>
            { children }
        </Context.Provider>
    )
};
