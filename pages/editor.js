import { useRef, useCallback, useState, Fragment } from 'react';
import Head from 'next/head';
import classNames from 'classnames';
import qs from 'qs';
import Header from 'components/header';
import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import dynamic from 'next/dynamic';
import config from '../config';

const Editor = dynamic(() => Promise.resolve(
  function Editor({ user, count, exceed }) {
    console.log('count:', count);
    const query = qs.parse(window.location.search.slice(1));
    const ganteRef = useRef(null);

    if (exceed) {
      return (
        <div>当前文档已超过最大同时在线人数 { count }</div>
      );
    }

    return (
      <div>

        <div className="w-full h-full text-black">
          <GanteProvider user={user} docId={query.id} ref={ganteRef}>
            <Header user={user} side="left" ganteRef={ganteRef} />
            <Container className="h-screen">
              <Content>
                <GanteGraph />
              </Content>
              <StatusBar className="fixed bottom-0 left-0 right-0 z-10" />
            </Container>
          </GanteProvider>
        </div>
      </div>
    );
}), {
  ssr: false
});

function EditorPage(props) {
  return (
    <Fragment>
      <Head>
        <title>Gante! 高效的项目管理，流程图在线工具</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Editor {...props}/>
    </Fragment>
  );
}

export default EditorPage;

import axios from 'axios';
import url from 'url';
import querystring from 'querystring';
export async function getServerSideProps({ res, req }) {
  const query = querystring.parse((url.parse(req.url).search || '').slice(1));
  const countReq = await axios({
    url: `http://localhost:8088/api/count?listId=${query.id}`,
    headers: {
      cookie: req.headers.cookie
    }
  });
  try {
    const userReq = await axios({
      url: 'http://localhost:8088/api/user',
      headers: {
        cookie: req.headers.cookie
      }
    });
    return {
      props: {
        exceed: countReq.data.exceed,
        count: countReq.data.count,
        user: userReq.data
      }
    };
  } catch(error) {
    return {
      props: {
        exceed: countReq.data.exceed,
        count: countReq.data.count,
      }
    };
  }
}
