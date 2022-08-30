import { useEffect, useCallback, useState, useRef, Fragment } from 'react';
import WebSocket from 'reconnecting-websocket';
import classNames from 'classnames';
import * as json1 from 'ot-json1';
import Client, { Connection } from 'sharedb/lib/client';
import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import Sidebar from '../components/sidebar';

Client.types.register(json1.type);
// 左边是一个TODO，右边是一个Gante
export default function Editor() {
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

  useEffect(() => {
    // const socket = new WebSocket('ws://116.62.19.157:9081/');
    const socket = new WebSocket('ws://localhost:9081/');

    socket.addEventListener('open', () => {
      const connection = new Connection(socket);
      const doc = connection.get('doc-collection', 'my-self');

      doc.subscribe((error) => {
        if (error) {
          console.error(error);
          return;
        }
        if (!doc.type) {
          doc.create(ganteRef.current.list, 'json1');
        } else {
          // doc.del();
          ganteRef.current.setList(doc.data || []);
        }

        docRef.current = doc;

        setConnected(true);
        setPending(false);

        let ops = [];
        let timer = null;
        ganteRef.current.event.on('op', (op) => {
          ops.push(op);
          if (timer) {
            return;
          }
          timer = setTimeout(() => {
            const o = ops.reduce(json1.type.compose, null);
            doc.submitOp(o);
            ops = [];
            timer = null;
          }, 50);
        });
      });

      doc.on('op', (op, source) => {
        if (!source) {
          ganteRef.current.setList(doc.toSnapshot().data);
        }
      });

      doc.on('error', (error) => {
        console.log('error', error);
      });
    });

    socket.addEventListener('error', () => {
      setConnected(false);
      setPending(false);
    });

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="w-full h-full">
      <Sidebar onExport={onExport} />
      <GanteProvider ref={ganteRef}>
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
