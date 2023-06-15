import { useRef, useCallback, useState, Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import classNames from 'classnames';
import qs from 'qs';
import Header from 'components/header';
import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import dynamic from 'next/dynamic';
import config from '../config';

const Editor = dynamic(() => Promise.resolve(
  function Editor({ user, count, exceed, hasPrivilege }) {
    console.log('count:', count);
    const query = qs.parse(window.location.search.slice(1));
    const ganteRef = useRef(null);

    if (exceed) {
      return (
        <div>当前文档已超过最大同时在线人数 { count }</div>
      );
    }

    if (!hasPrivilege) {
      return (
        <div className="fixed left-0 top-0 bottom-0 right-0 bg-[#ccc] flex items-center justify-center">
          <div className="text-center flex items-center flex-col">
            <Link href="/">
              <div className="hover:border-sky-500 hover:border rounded border-box transition cursor-pointer bg-[url(/logo.png)] w-[100px] h-[100px] bg-center bg-contain bg-no-repeat"></div>
            </Link>
            <div className="text-center mt-4">
              无权限访问或当前会话过期，请重新登陆哦
            </div>
          </div>
        </div>
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
              <StatusBar className="fixed bottom-0 left-0 right-0 z-10 select-none" />
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
    url: `http://localhost:8088/api/count?listId=${query.id || 0}`,
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

    const hasPrivilege = query.id === 'guest' || query.id === userReq.data.defaultTableId;

    return {
      props: {
        hasPrivilege,
        exceed: countReq.data.exceed,
        count: countReq.data.count,
        user: userReq.data
      }
    };
  } catch(error) {
    return {
      props: {
        hasPrivilege: query.id === 'guest',
        exceed: countReq.data.exceed,
        count: countReq.data.count,
      }
    };
  }
}
