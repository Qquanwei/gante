import React, { useMemo, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useConnectionRef } from 'recoil-sharedb';


const CONNECTED = 'connected';
const DISCONNECTED = 'disconnected';
const CONNECTING = 'connecting';
const READY = 'ready';


export default React.memo(function StatusBar({ className, children }) {
  const connectionRef = useConnectionRef();
  const [hasPending, setHasPending] = useState(0);
  const [state, setState] = useState(() => {
    return connectionRef.current.state;
  });

  const iconMap = {
    [CONNECTED]: (
      <div className="text-yellow-500 text-[12px] cursor-pointer">连接中</div>
    ),
    [DISCONNECTED]: (
      <div className="text-red-500 text-[12px] cursor-pointer">重连中...</div>
    ),
    [CONNECTED]: (
      <div className="text-green-500 text-[12px] cursor-pointer">已连接</div>
    ),
    [READY]: (
      <div className="text-green-500 text-[12px] cursor-pointer">已就绪</div>
    )
  };

  const pendingMap = {
    [true]: (
      <div className="text-[12px] ml-2 text-green-300">保存中...</div>
    ),
    [false]: (
      <div className="text-[12px] ml-2 text-green-500">已保存</div>
    )
  };

  useEffect(() => {
    const con = connectionRef.current;
    function stateChange(newState) {
      setState(newState);
    }
    function receiveChange(message) {
      setTimeout(() => {
        setHasPending(v => Math.max(v-1, 0));
      }, 200);
    }

    function sendChange(message){
      setHasPending(v => v+1);
    }

    con.on('state', stateChange);
    // con.on('send', sendChange);
    // con.on('receive', receiveChange);

    return () => {
      con.off('state', stateChange);
    };
  }, []);

  return (
    <div className={classNames(className, 'h-[30px] px-[80px] bg-[#f0f0f0] flex items-center border-t-white border box-border')}>
      { iconMap[state] }
      { children }
    </div>
  );
})
