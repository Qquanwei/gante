import React, { ReactNode, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useConnectionRef } from 'recoil-sharedb';
import { useRecoilValueLoadable } from 'recoil';
import * as atoms from './atom';

const pendingMap = {
  ['true']: (
    <div className="text-[12px] ml-2 text-green-300">保存中...</div>
  ),
  ['false']: (
    <div className="text-[12px] ml-2 text-green-500">已全部保存</div>
  )
};

const readyMap = {
  ['false']: (
    <div className="text-[12px] ml-2 text-orange-500">文档未就绪，数据接收中...</div>
  )
}

interface IStatusBarProps {
  className?: string;
  children: ReactNode;
}

export default React.memo<IStatusBarProps>(function StatusBar({ className, children }) {
  const [allNodeReady, setAllNodeReady] = useState(false);
  const connectionRef = useConnectionRef();
  const [hasPending, setHasPending] = useState(false);
  const allNodeLoadable = useRecoilValueLoadable(atoms.allNodes);



  useEffect(() => {
    if (allNodeLoadable.state === 'hasValue') {
      setAllNodeReady(true);
    }
  }, [allNodeLoadable.state]);

  useEffect(() => {
    const con = connectionRef.current;

    if (!con) {
      return () => {};
    }

    let nothingPendingFlag = false;
    function onSendCheck() {
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

    const timer = setInterval(() => {
      onSendCheck();
    }, 1000);

    con.on('send', onSendCheck);

    return () => {
      clearInterval(timer);
      con.off('send', onSendCheck);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionRef, connectionRef.current]);

  return (
    <div className={classNames(className, 'h-[30px] px-[80px] bg-[#f0f0f0] flex items-center border-t-white border box-border')}>
      { pendingMap[hasPending + ''] }
      { readyMap[allNodeReady + '']}
      { children }
    </div>
  );
});
