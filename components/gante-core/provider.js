import React, { useReducer, useMemo, useState, useCallback, useRef } from 'react';

const Context = React.createContext();

export {
    Context
};

export default function Provider({ children }) {
    const graphRef = useRef(null);

    const [list, setList] = useState([
        {
            title: 'there is title'
        },
        {
            title: 'there is title2'
        }
    ]);

    const registeMouseMove = useCallback(() => {
    }, []);

    const contextValue = useMemo(() => {
        return {
            // 每个甬道的高度
            SINK_HEIGHT: 30,
            // 每个时间节点的宽度
            SPOT_WIDTH: 30,
            graphRef,
            currentTime: 10.5,
            list
        };
    }, [list]);

    return (
        <Context.Provider value={contextValue}>
            { children }
        </Context.Provider>
    )
};
