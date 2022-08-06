import { useEffect, useCallback, useState, useRef } from 'react';
import WebSocket from 'reconnecting-websocket';
import { Connection } from 'sharedb/lib/client';

import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import MainInput from 'components/main-input';
import Sidebar from '../components/sidebar';
import styles from './editor.module.css';

// 左边是一个TODO，右边是一个Gante

export default function Editor() {
  const ganteRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:7001/');
    const connection = new Connection(socket);
    return () => {
      // socket.disconnect();
    }
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
