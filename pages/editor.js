import { useEffect, useCallback, useState, useRef, Fragment } from 'react';
import WebSocket from 'reconnecting-websocket';
import classNames from 'classnames';
import * as json1 from 'ot-json1';
import Client, { Connection } from 'sharedb/lib/client';
import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import MainInput from 'components/main-input';
import Sidebar from '../components/sidebar';

Client.types.register(json1.type);
// 左边是一个TODO，右边是一个Gante
export default function Editor() {
  const [connected, setConnected] = useState(false);
  const ganteRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.1.2:9081/');

    socket.addEventListener('open', () => {
      const connection = new Connection(socket);
      const doc = connection.get('doc-collection', 'doc-id');

      doc.subscribe((error) => {
        if (error) {
          console.error(error);
          return;
        }
        if (!doc.type) {
          doc.create(ganteRef.current.list, 'json1');
        } else {
          // doc.del();
          ganteRef.current.setList(doc.data);
        }

        setConnected(true);

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
          }, 500);
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

    return () => {
      socket.close();
    };
  }, []);

  const onInputChange = useCallback((value) => {
    if (value) {
      ganteRef.current.createNewItem({
        title: value,
        startTime: Date.now(),
        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000
      });
    }
  }, []);

  return (
    <GanteProvider ref={ganteRef}>
      <div className="flex justify-center py-10">
        <MainInput onChange={onInputChange} placeholder="创建一条..."/>
      </div>
      <Container className="h-screen">
        <Content>
          <GanteGraph />
        </Content>
        <StatusBar className="fixed bottom-0 left-0 z-10 w-30">
          <Fragment>
            <span className={classNames("shrink-0 block rounded-full w-3 h-3", !connected ? 'bg-gray-300' : 'bg-green-500' )}></span>
            <span className="text-xs ml-2 inline-block whitespace-nowrap">
              {
                connected ? '连接成功' : '连接失败'
              }
            </span>
          </Fragment>
        </StatusBar>
      </Container>
    </GanteProvider>
  );
}
