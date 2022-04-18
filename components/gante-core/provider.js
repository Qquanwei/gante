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
        }
    ]);

    const registeMouseMove = useCallback(() => {
    }, []);

    const contextValue = useMemo(() => {
        return {
            // 每个甬道的高度
            SINK_HEIGHT: 30,
            graphRef,
            list
        };
    }, [list]);

    return (
        <Context.Provider value={contextValue}>
            { children }
        </Context.Provider>
    )
};
