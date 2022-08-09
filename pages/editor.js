import { useEffect, useCallback, useState, useRef } from 'react';
import WebSocket from 'reconnecting-websocket';
import * as json1 from 'ot-json1';
// import io from 'socket.io-client';
import Client, { Connection } from 'sharedb/lib/client';
import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import MainInput from 'components/main-input';
import Sidebar from '../components/sidebar';

Client.types.register(json1.type);
// 左边是一个TODO，右边是一个Gante
export default function Editor() {
  const ganteRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:9081/');

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

        ganteRef.current.event.on('op', (op) => {
          setTimeout(() => {
            doc.submitOp(op);
          });
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
      <StatusBar className="fixed bottom-0"/>
      </Container>
    </GanteProvider>
  );
}
