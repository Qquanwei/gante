import { useRef, useCallback, useState } from 'react';
import classNames from 'classnames';
import qs from 'qs';
import Header from 'components/header';
import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import dynamic from 'next/dynamic';
import config from '../config';

// 左边是一个TODO，右边是一个Gante
export default dynamic(() => Promise.resolve(
  function Editor({ user }) {
    const query = qs.parse(window.location.search.slice(1));
    const ganteRef = useRef(null);

    return (
      <div>
        <div className="w-full h-full text-black">
          <GanteProvider docId={query.id} ref={ganteRef}>
            <Header user={user} side="left" ganteRef={ganteRef} />
            <Container className="h-screen">
              <Content>
                <GanteGraph />
              </Content>
              <StatusBar className="fixed bottom-0 left-0 z-10 w-30">
              </StatusBar>
            </Container>
          </GanteProvider>
        </div>
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
