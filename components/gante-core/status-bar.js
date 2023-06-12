import React, { useMemo, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useConnectionRef } from 'recoil-sharedb';


const CONNECTED = 'connected';
const DISCONNECTED = 'disconnected';
const CONNECTING = 'connecting';
const READY = 'ready';


export default React.memo(function StatusBar({ className, children }) {
  const connectionRef = useConnectionRef();
  const [hasPending, setHasPending] = useState(false);
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
      <div className="text-[12px] ml-2 text-green-500">已全部保存</div>
    )
  };

  useEffect(() => {
    const con = connectionRef.current;

    function stateChange(newState) {
      setState(newState);
    }

    let nothingPendingFlag = false;
    function onSend() {
      if (con.hasWritePending()) {
        setHasPending(true);
        if (!nothingPendingFlag) {
          nothingPendingFlag = true;
          con.whenNothingPending(() => {
            setHasPending(false);
            nothingPendingFlag = false;
          });
        }
      } else {
        setHasPending(false);
      }
    }

    con.on('send', onSend);
    con.on('state', stateChange);

    return () => {
      con.off('state', stateChange);
      con.off('send', onSend);
    };
  }, []);

  return (
    <div className={classNames(className, 'h-[30px] px-[80px] bg-[#f0f0f0] flex items-center border-t-white border box-border')}>
      { pendingMap[hasPending] }
    </div>
  );
});
