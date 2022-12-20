import { useEffect, useCallback, useState, useRef, Fragment } from 'react';
import classNames from 'classnames';
import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import Sidebar from '../components/sidebar';
import config from '../config';

// 左边是一个TODO，右边是一个Gante
export default function Editor({ user }) {
  const [pending, setPending] = useState(true);
  const [connected, setConnected] = useState(false);
  const ganteRef = useRef(null);
  const docRef = useRef(null);

  const onExport = useCallback(() => {
    const a = document.createElement('a');
    const data = docRef.current.toSnapshot().data;
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
    a.href = dataStr;
    a.setAttribute('download', `gante-snapshot-${Date.now()}.json`);
    a.click();
  }, []);

  console.log(user);
  return (
    <div className="w-[1000px] h-full">
      <GanteProvider ref={ganteRef}>
        <Sidebar onExport={onExport} pending={pending} connected={connected} />
        <Container className="h-screen">
          <Content>
            <GanteGraph />
          </Content>
          <StatusBar className="fixed bottom-0 left-0 z-10 w-30">
            <Fragment>
              <span className={classNames("shrink-0 block rounded-full w-3 h-3", !connected ? 'bg-gray-300' : 'bg-green-500' )}></span>
              <span className="text-xs ml-2 inline-block whitespace-nowrap">
                {
                  (() => {
                    if (pending) {
                      return '连接中';
                    }
                    return connected ? '连接成功' : '连接异常';
                  })()
                }
              </span>
            </Fragment>
          </StatusBar>
        </Container>
      </GanteProvider>
    </div>
  );
}

export function getServerSideProps({ res, req }) {
  return {
    props: {
      user: {
        userId: 1000
      }
    }
  };
}
