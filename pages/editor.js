import { useEffect, useCallback, useState, useRef, Fragment } from 'react';
import classNames from 'classnames';
import qs from 'qs';
import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import dynamic from 'next/dynamic';
import Sidebar from '../components/sidebar';
import config from '../config';

// 左边是一个TODO，右边是一个Gante
export default dynamic(() => Promise.resolve(
  function Editor({ user }) {
    const [pending, setPending] = useState(true);
    const [connected, setConnected] = useState(false);
    const ganteRef = useRef(null);

    const query = qs.parse(window.location.search.slice(1));

    return (
      <div className="w-[1000px] h-full">
        <GanteProvider ref={ganteRef} docId={query.id || 'default-table'}>
          <Sidebar pending={pending} connected={connected} />
          <Container className="h-screen">
            <Content>
              <GanteGraph />
            </Content>
            <StatusBar className="fixed bottom-0 left-0 z-10 w-30">
              <Fragment>
                <span className={classNames("shrink-0 block rounded-full w-3 h-3", !connected ? 'bg-gray-300' : 'bg-green-500' )}></span>
                <span className="text-xs ml-2 inline-block whitespace-nowrap">
                </span>
              </Fragment>
            </StatusBar>
          </Container>
        </GanteProvider>
      </div>
    );
}), {
  ssr: false
});

import axios from 'axios';
export async function getServerSideProps({ res, req }) {
  try {
    const userReq = await axios({
      url: 'http://localhost:8088/api/user',
      headers: {
        cookie: req.headers.cookie
      }
    });
    return {
      props: {
        user: userReq.data
      }
    };
  } catch(error) {
    return {
      props: {}
    };
  }
}
